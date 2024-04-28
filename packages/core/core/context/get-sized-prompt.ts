import { validate } from 'json-schema';
import { ExperimentalMessage, ExperimentalUserMessage } from '../prompt';
import { convertToLanguageModelPrompt } from '../prompt/convert-to-language-model-prompt';
import {
  MessageValidatedPrompt,
  PromptValidatedPrompt,
  ValidatedPrompt,
} from '../prompt/get-validated-prompt';
import { ContextWindowHandler, Tokenizer } from './context-window-handler';
import {
  TooManyTokensError,
  UnsupportedMessageError,
  MissingMaxTokensError,
  SystemPromptTooManyTokensError,
} from './errors';

export async function getSizedPrompt(
  prompt: ValidatedPrompt,
  context: ContextWindowHandler,
  maxContextSize: number | undefined,
): Promise<ValidatedPrompt> {
  const { strategy } = context;
  if (strategy === 'none') return Promise.resolve(prompt);
  if (maxContextSize === undefined) throw new MissingMaxTokensError();
  let newPrompt: ValidatedPrompt;
  switch (prompt.type) {
    case 'prompt': {
      newPrompt = await truncatePrompt(
        prompt,
        context as ContextWindowHandler,
        maxContextSize,
      );
      break
    }
    case 'messages': {
      newPrompt = await truncateMessages(
        prompt,
        context as ContextWindowHandler,
        maxContextSize,
      );
      break
    }
  }
  const normalized = convertToLanguageModelPrompt(newPrompt);
  context.onContextWindow?.(normalized)
  return newPrompt;
}

async function truncatePrompt(
  prompt: PromptValidatedPrompt,
  context: ContextWindowHandler,
  maxContextSize: number,
): Promise<PromptValidatedPrompt> {
  const reader = (message: string) => message;
  const writer = (_item: string, content: string) => content;
  const { system, prompt: message } = prompt;
  const messages = [message];
  const newPrompt = await truncate(
    reader,
    writer,
    context,
    maxContextSize,
    system,
    messages,
  ).then(messages => messages[0]);
  return {
    ...prompt,
    prompt: newPrompt,
  };
}

async function truncateMessages(
  prompt: MessageValidatedPrompt,
  context: ContextWindowHandler,
  maxContextSize: number,
): Promise<MessageValidatedPrompt> {
  const reader = (message: ExperimentalMessage): string => {
    if (typeof message.content === 'string') return message.content;
    else throw new UnsupportedMessageError();
  };
  const writer = (
    item: ExperimentalMessage,
    content: string,
  ): ExperimentalMessage => {
    if (typeof item.content === 'string')
      return { ...item, content } as ExperimentalUserMessage;
    else throw new UnsupportedMessageError();
  };
  const { system, messages } = prompt;
  const newMessages = await truncate(
    reader,
    writer,
    context,
    maxContextSize,
    system,
    messages,
  );
  return {
    ...prompt,
    messages: newMessages,
  };
}

async function truncate<T>(
  read: (message: T) => string,
  write: (item: T, message: string) => T,
  context: ContextWindowHandler,
  maxContextLength: number,
  system: string | undefined,
  messages: T[],
): Promise<T[]> {
  const { tokenizer, strategy, onContextWindow } = context;
  if (strategy === 'none') return messages;
  let tokenCount = 0;
  let allowedMessages: T[] = [];
  const systemPromptTokens = system ? await tokenizer(system) : [];
  const systemPromptLength = systemPromptTokens.length;
  if (systemPromptLength > maxContextLength)
    throw new SystemPromptTooManyTokensError(maxContextLength);
  const messagesReversed = messages.slice().reverse();
  for (const message of messagesReversed) {
    const content = read(message);
    const tokens = await tokenizer(content);
    const tokensLength = tokens.length;
    if (systemPromptLength + tokenCount + tokensLength > maxContextLength) {
      if (strategy === 'remove') break;
      else if (strategy === 'error')
        throw new TooManyTokensError(maxContextLength);
      else if (strategy === 'summarize')
        throw new Error('Summarize strategy not yet supported, coming soon!');
      else if (strategy === 'custom') {
        allowedMessages = await context.customHandler<T>(
          allowedMessages,
          message,
          read,
          write,
        );
        tokenCount = await countTokens(tokenizer, read, allowedMessages);
        continue;
      }
    }
    allowedMessages.push(message);
    tokenCount += tokensLength;
  }
  if (systemPromptLength + tokenCount > maxContextLength)
    throw new TooManyTokensError(maxContextLength);
  const newContextWindow = allowedMessages.slice().reverse();
  return newContextWindow;
}

const countTokens = async <T>(
  tokenizer: Tokenizer,
  read: (message: T) => string,
  messages: T[],
) =>
  messages.reduce(async (acc, message) => {
    const tokens = await tokenizer(read(message));
    return await acc.then(acc => acc + tokens.length);
  }, Promise.resolve(0));
