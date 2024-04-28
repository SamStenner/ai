import { LanguageModelV1Prompt } from '@ai-sdk/provider';
import { ExperimentalMessage } from '../prompt';

/**
 * TruncateStrategy is used to determine how to handle the content when it exceeds the maximum length.
 *
 * - `remove`: Remove the content that exceeds the maximum length, starting from the earliest content.
 *
 * - `summarize`: Summarize the content that exceeds the maximum length, and insert the summary at the start.
 *
 * - `none`: Do not truncate the content.
 *
 * - `error`: Throw an error if the content exceeds the maximum length.
 *
 */
export type TruncateStrategy =
  | 'remove'
  | 'summarize'
  | 'custom'
  | 'none'
  | 'error';

/**
 * A function that tokenizes the provided content.
 */
export type Tokenizer = (content: string) => string[] | Promise<string[]>;

type BaseContextWindowHandler = {
  tokenizer: Tokenizer;
  onContextWindow?(prompt: LanguageModelV1Prompt): void | Promise<void>;
};

/**
 * Represents a context window handler when the strategy is not 'custom'.
 */
export type GeneralContextWindowHandler = BaseContextWindowHandler & {
  strategy: Exclude<TruncateStrategy, 'custom'>;
};

/**
 * Represents a context window handler when the strategy is 'custom'.
 * This includes a custom callback for handling the content.
 */
export type CustomContextWindowHandler = BaseContextWindowHandler & {
  strategy: 'custom';
  customHandler<T>(
    messages: T[],
    message: T,
    reader: (message: T) => string,
    writer: (item: T, content: string) => T,
  ): T[] | Promise<T[]>;
}

/**
 * Context window handler, where the structure differs based on the strategy.
 * - If the strategy is 'custom', a customHandler is required.
 * - Otherwise, it's just the strategy and optionally a tokenizer.
 */
export type ContextWindowHandler =
  | GeneralContextWindowHandler
  | CustomContextWindowHandler;

export const defaultContextWindowHandler = (tokenizer: Tokenizer): ContextWindowHandler => ({
  tokenizer,
  strategy: 'remove',
});

/**
 * A function that tokenizes the provided content by splitting it by spaces.
 * This is not a realistic tokenizer, and should be replaced with a more sophisticated one.
 * However, it can be used as a placeholder for testing.
 */
export const basicTokenizer = (text: string): string[] => text.split(' ');