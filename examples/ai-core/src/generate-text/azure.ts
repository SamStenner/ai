import { experimental_generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const openai = createOpenAI({
    baseURL: 'https://openai.azure.com',
    models: {
      'gpt-4-azure': 8_192,
    },
  });
  const result = await experimental_generateText({
    model: openai('gpt-4-azure'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  console.log(result.text);
}

main().catch(console.error);
