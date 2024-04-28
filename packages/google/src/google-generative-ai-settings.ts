// https://ai.google.dev/models/gemini
export type GoogleGenerativeAIModelId =
  | 'models/gemini-1.5-pro-latest'
  | 'models/gemini-pro'
  | 'models/gemini-pro-vision';

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
export const googleGenerativeAIModelTokens: Record<
  GoogleGenerativeAIModelId,
  number
> = {
  'models/gemini-1.5-pro-latest': 1_048_576,
  'models/gemini-pro': 30_720,
  'models/gemini-pro-vision': 12_288,
};
