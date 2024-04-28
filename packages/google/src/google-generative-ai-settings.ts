// https://ai.google.dev/models/gemini
export type GoogleGenerativeAIModelId =
  | 'models/gemini-1.5-pro-latest'
  | 'models/gemini-pro'
  | 'models/gemini-pro-vision'
  | (string & {});

export interface GoogleGenerativeAISettings {
  /**
Optional. The maximum number of tokens to consider when sampling.

Models use nucleus sampling or combined Top-k and nucleus sampling. 
Top-k sampling considers the set of topK most probable tokens. 
Models running with nucleus sampling don't allow topK setting.
   */
  topK?: number;
}

/**
 * Tokens allowed for each model.
 */
export const googleGenerativeAIModelTokens: Record<GoogleGenerativeAIModelId, number | undefined> = {
  'models/gemini-1.5-pro-latest': 4096,
  'models/gemini-pro': 4096,
  'models/gemini-pro-vision': 4096,
};