import { basicTokenizer, defaultContextWindowHandler, experimental_generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const result = await experimental_generateText({
    system: 'You are cool',
    model: openai('gpt-3.5-turbo-0613'),
    prompt: "Invent a new holiday and describe its traditions.",
    contextHandler: defaultContextWindowHandler(basicTokenizer),
  });
  console.log(result.text);
}

main().catch(console.error);
