/**
 * TruncateStrategy is used to determine how to handle the content when it exceeds the maximum length.
 *
 * - `remove`: Remove the content that exceeds the maximum length, starting from the earliest content.
 *
 * - `summarize`: Summarize the content that exceeds the maximum length, and insert the summary at the start.
 *
 * - `none`: Do not truncate the content. This is the same as not providing a strategy.
 *
 * - `error`: Throw an error if the content exceeds the maximum length.
 *
 */
export type TruncateStrategy = 'remove' | 'summarize' | 'none' | 'error';

/**
 * A function which tokenizes the provided content.
 */
export type Tokenizer<T = string> = (content: T) => T[] | Promise<T[]>;

/**
 * A context window handler is used to handle the context window for a language model.
 * It is used to tokenize the context window and to determine how to handle the
 * context window when it exceeds the maximum length.
 */
export type ContextWindowHandler<T = string> = {
  tokenizer?: Tokenizer<T>;
  strategy?: TruncateStrategy;
};
