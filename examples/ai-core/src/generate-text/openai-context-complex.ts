import { ContextWindowHandler, basicTokenizer, defaultContextWindowHandler, experimental_generateText } from 'ai';
import { createOpenAI, openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { write } from 'fs';

dotenv.config();

async function main() {
  const openai = createOpenAI({
    models: {
      'gpt-4-turbo': 10 // Overriding gpt-4-turbo with only 10 tokens
    }
  })
  /**
   * In this example, the user will ask about the meaning of life. However, the question
   * is longer than 10 tokens, so it will fallback to the custom strategy. The custom
   * strategy simple provides a brand new array with a single message: "I love you".
   * Since "I love you" is only 3 tokens, it will fit in the context window.
   */
  const contextHandler: ContextWindowHandler = {
    tokenizer: basicTokenizer,
    strategy: "custom",
    customHandler: (_messages, message, _read, write) => [write(message, "I love you")],
  }
  const result = await experimental_generateText({
    contextHandler,
    model: openai('gpt-4-turbo'),
    prompt: "In your view, what is the true meaning of life? Do not be afraid to be philosophical."
  });
  console.log(result.text);
}

main().catch(console.error);
