export class MissingMaxTokensError extends Error {
  constructor() {
    super('Missing maxTokens value');
  }
}

export class UnsupportedMessageError extends Error {
  constructor() {
    super('Token management for non-string messages not yet supported');
  }
}

export class TooManyTokensError extends Error {
  constructor(maxTokens: number) {
    super(`Too many tokens - maximum is ${maxTokens}`);
  }
}

export class SystemPromptTooManyTokensError extends Error {
  constructor(maxTokens: number) {
    super(`System prompt too long - maximum is ${maxTokens}`);
  }
}
