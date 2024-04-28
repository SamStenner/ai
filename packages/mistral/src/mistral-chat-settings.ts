// https://docs.mistral.ai/platform/endpoints/
export type MistralChatModelId =
  | 'open-mistral-7b'
  | 'open-mixtral-8x7b'
  | 'mistral-small-latest'
  | 'mistral-medium-latest'
  | 'mistral-large-latest';

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
export const mistralChatModelTokens: Record<MistralChatModelId, number> = {
  'open-mistral-7b': 32_000,
  'open-mixtral-8x7b': 32_000,
  'mistral-small-latest': 32_000,
  'mistral-medium-latest': 32_000,
  'mistral-large-latest': 32_000,
};
