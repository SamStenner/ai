import { OpenAIChatLanguageModel } from './openai-chat-language-model';
import { OpenAIChatModelId, OpenAIChatSettings } from './openai-chat-settings';
import { OpenAICompletionLanguageModel } from './openai-completion-language-model';
import {
  OpenAICompletionModelId,
  OpenAICompletionSettings,
} from './openai-completion-settings';
import { OpenAI } from './openai-facade';

export type CustomModel<T extends string> = Record<T, number>;

export interface OpenAIProvider<T extends string> {
  (
    modelId: 'gpt-3.5-turbo-instruct' | T,
    settings?: OpenAICompletionSettings,
  ): OpenAICompletionLanguageModel<T>;
  (
    modelId: OpenAIChatModelId | T,
    settings?: OpenAIChatSettings,
  ): OpenAIChatLanguageModel<T>;

  chat(
    modelId: OpenAIChatModelId | T,
    settings?: OpenAIChatSettings,
  ): OpenAIChatLanguageModel<T>;

  completion(
    modelId: OpenAICompletionModelId | T,
    settings?: OpenAICompletionSettings,
  ): OpenAICompletionLanguageModel<T>;
}

export interface OpenAIProviderSettings<T extends string> {
  /**
Base URL for the OpenAI API calls.
     */
  baseURL?: string;

  /**
@deprecated Use `baseURL` instead.
     */
  baseUrl?: string;

  /**
API key for authenticating requests.
     */
  apiKey?: string;

  /**
OpenAI Organization.
     */
  organization?: string;

  /**
OpenAI project.
     */
  project?: string;

  /**
Custom headers to include in the requests.
     */
  headers?: Record<string, string>;

  /**
Custom models to include in the provider.
   */
  models?: CustomModel<T>;
}

/**
Create an OpenAI provider instance.
 */
export function createOpenAI<CustomChatModelId extends string = never>(
  options: OpenAIProviderSettings<CustomChatModelId> = {},
): OpenAIProvider<CustomChatModelId> {
  const openai = new OpenAI<CustomChatModelId>(options);

  const provider = function (
    modelId:
      | OpenAIChatModelId
      | OpenAICompletionModelId
      | keyof typeof openai.customModelIds,
    settings?: OpenAIChatSettings | OpenAICompletionSettings,
  ) {
    if (new.target) {
      throw new Error(
        'The OpenAI model function cannot be called with the new keyword.',
      );
    }
    if (modelId === 'gpt-3.5-turbo-instruct') {
      return openai.completion(modelId, settings as OpenAICompletionSettings);
    } else {
      return openai.chat(modelId, settings as OpenAIChatSettings);
    }
  };

  provider.chat = openai.chat.bind(openai);
  provider.completion = openai.completion.bind(openai);
  return provider as OpenAIProvider<CustomChatModelId>;
}

/**
 * Default OpenAI provider instance.
 */
export const openai = createOpenAI();
