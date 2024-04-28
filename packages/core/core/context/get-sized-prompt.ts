import { ExperimentalMessage } from '../prompt';
import {
  MessageValidatedPrompt,
  PromptValidatedPrompt,
  ValidatedPrompt,
} from '../prompt/get-validated-prompt';
import {
  ContextWindowHandler,
  Tokenizer,
  TruncateStrategy,
} from './context-window-handler';
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
  const { tokenizer, strategy = 'remove' } = context;
  if (!tokenizer || strategy === 'none') return Promise.resolve(prompt);
  if (maxContextSize === undefined) throw new MissingMaxTokensError();
  switch (prompt.type) {
    case 'prompt':
      return await truncatePrompt(prompt, tokenizer, strategy, maxContextSize);
    case 'messages':
      return await truncateMessages(prompt, tokenizer, strategy, maxContextSize);
  }
}

async function truncatePrompt(
  prompt: PromptValidatedPrompt,
  tokenizer: Tokenizer,
  strategy: TruncateStrategy,
  maxContextSize: number,
): Promise<PromptValidatedPrompt> {
  const normalizer = (message: string) => message;
  const { system, prompt: message } = prompt;
  const messages = [message];
  const newPrompt = await truncate(
    normalizer,
    tokenizer,
    strategy,
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
  tokenizer: Tokenizer,
  strategy: TruncateStrategy,
  maxContextSize: number,
): Promise<MessageValidatedPrompt> {
  const normalizer = (message: ExperimentalMessage) => {
    if (typeof message.content === 'string') return message.content;
    else throw new UnsupportedMessageError();
  };
  const { system, messages } = prompt;
  const newMessages = await truncate(
    normalizer,
    tokenizer,
    strategy,
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
  normalize: (message: T) => string,
  tokenizer: Tokenizer,
  strategy: TruncateStrategy,
  maxContextLength: number,
  system: string | undefined,
  messages: T[],
): Promise<T[]> {
  if (strategy === 'none') return messages;
  let tokenCount = 0;
  let allowedMessages: T[] = [];
  const systemPromptTokens = system ? await tokenizer(system) : [];
  const systemPromptLength = systemPromptTokens.length;
  if (systemPromptLength > maxContextLength)
    throw new SystemPromptTooManyTokensError(maxContextLength);
  for (const message of messages) {
    const content = normalize(message);
    const tokens = await tokenizer(content);
    const tokensLength = tokens.length;
    if (systemPromptLength + tokenCount + tokensLength > maxContextLength) {
      if (strategy === 'remove') break;
      else if (strategy === 'error') throw new TooManyTokensError(maxContextLength);
      else if (strategy === 'summarize')
        throw new Error('Summarize strategy not yet supported, coming soon!');
    }
    allowedMessages.push(message);
    tokenCount += tokensLength;
  }
  return allowedMessages;
}
