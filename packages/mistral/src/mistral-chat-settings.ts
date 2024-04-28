// https://docs.mistral.ai/platform/endpoints/
export type MistralChatModelId =
  | 'open-mistral-7b'
  | 'open-mixtral-8x7b'
  | 'mistral-small-latest'
  | 'mistral-medium-latest'
  | 'mistral-large-latest'
  | (string & {});

export interface MistralChatSettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;
}

/**
 * Tokens allowed for each model.
 */
export const mistralChatModelTokens: Record<MistralChatModelId, number | undefined> = {
  "open-mistral-7b": 0,
  "open-mixtral-8x7b": 0,
  "mistral-small-latest": 0,
  "mistral-medium-latest": 0,
  "mistral-large-latest": 0
}