import { ContextWindowHandler, basicTokenizer, defaultContextWindowHandler, experimental_generateText } from 'ai';
import { createOpenAI, openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const openai = createOpenAI({
    models: {
      'gpt-4-turbo': 20 // Overriding gpt-4-turbo with only 20 tokens
    }
  })
  const contextHandler: ContextWindowHandler = {
    tokenizer: basicTokenizer,
    strategy: "remove",
    onContextWindow: (prompt) => console.log(prompt)
  }
  /**
   * In this example, the user will claim to love various animals,
   * and then ask which birds they like. Since these messages do not
   * fit in the context window, the first messages will be removed.
   * This means the system will not know about the user's love for robins,
   * so will only respond that the user likes eagles.
   */
  const result = await experimental_generateText({
    contextHandler,
    system: 'You are an expert on animals.',
    model: openai('gpt-4-turbo'),
    messages: [
      { role: "user", content: "I love robins" },
      { role: "user", content: "I love dogs" },
      { role: "user", content: "I love cats" },
      { role: "user", content: "I love snakes" },
      { role: "user", content: "I love grasshoppers" },
      { role: "user", content: "I love lions" },
      { role: "user", content: "I love eagles" },
      { role: "user", content: "Which birds do I like?" },
    ],
  });
  console.log(result.text);
}

main().catch(console.error);
