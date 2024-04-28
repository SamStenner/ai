import { ExperimentalMessage } from '../prompt';
import {
  MessageValidatedPrompt,
  PromptValidatedPrompt,
  ValidatedPrompt,
} from '../prompt/get-validated-prompt';
import { ContextWindowHandler, Tokenizer, TruncateStrategy } from './context-window-handler';
import { TooManyTokensError, UnsupportedMessageError, MissingMaxTokensError } from './errors';

export async function getSizedPrompt(
  prompt: ValidatedPrompt,
  context: ContextWindowHandler,
  maxTokens: number | undefined,
): Promise<ValidatedPrompt> {
  const { tokenizer, strategy = 'remove' } = context;
  if (!tokenizer || strategy === 'none') return Promise.resolve(prompt);
  if (maxTokens === undefined) throw new MissingMaxTokensError()
  switch (prompt.type) {
    case 'prompt':
      return await truncatePrompt(prompt, tokenizer, strategy, maxTokens);
    case 'messages':
      return await truncateMessages(prompt, tokenizer, strategy, maxTokens);
  }
}

async function truncatePrompt(
  prompt: PromptValidatedPrompt,
  tokenizer: Tokenizer,
  strategy: TruncateStrategy,
  maxTokens: number,
): Promise<PromptValidatedPrompt> {
  const normalizer = (message: string) => message;
  const messages = [prompt.prompt];
  const newPrompt = await truncate(normalizer, tokenizer, strategy, maxTokens, messages).then(messages => messages[0]);
  return {
    ...prompt,
    prompt: newPrompt,
  };
}

async function truncateMessages(
  prompt: MessageValidatedPrompt,
  tokenizer: Tokenizer,
  strategy: TruncateStrategy,
  maxTokens: number,
): Promise<MessageValidatedPrompt> {
  const normalizer = (message: ExperimentalMessage) => {
    if (typeof message.content === 'string') return message.content;
    else throw new UnsupportedMessageError();
  };
  const newMessages = await truncate(
    normalizer,
    tokenizer,
    strategy,
    maxTokens,
    prompt.messages,
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
  maxTokens: number,
  messages: T[],
): Promise<T[]> {
  if (strategy === 'none') return messages;
  let tokenCount = 0;
  let allowedMessages: T[] = [];
  for (const message of messages) {
    const content = normalize(message);
    const tokens = await tokenizer(content);
    const tokensLength = tokens.length;
    if (tokenCount + tokensLength > maxTokens) {
      if (strategy === 'remove') break;
      else if (strategy === 'error') throw new TooManyTokensError(maxTokens);
      else if (strategy === "summarize") throw new Error("Summarize strategy not yet supported, coming soon!")
    }
    allowedMessages.push(message);
    tokenCount += tokensLength;
  }
  return allowedMessages;
}
