import { experimental_generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';

dotenv.config();

const perplexity = createOpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY ?? '',
  baseURL: 'https://api.perplexity.ai/',
  models: {
    'sonar-medium-chat': 16_384,
    'sonar-medium-online': 12_000,
  },
});

async function main() {
  const result = await experimental_generateText({
    model: perplexity('sonar-medium-online'),
    prompt: 'What is the current price of $TSLA stock?',
  });

  console.log(result.text);
}

main().catch(console.error);
