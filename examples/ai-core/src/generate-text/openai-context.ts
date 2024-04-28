import { ContextWindowHandler, experimental_generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';

dotenv.config();

const randomText = (length: number): string =>
  Array.from({ length }, () =>
    String.fromCharCode(32 + Math.floor(Math.random() * 95)),
  ).join('');

async function main() {
  const contextHandler: ContextWindowHandler = {
    tokenizer: basicTokenizer,
    strategy: 'remove',
  };
  const text = randomText(500_000);
  await experimental_generateText({
    model: openai('gpt-3.5-turbo-0613'),
    prompt: text,
    contextHandler,
  });
}

main().catch(console.error);

function basicTokenizer(text: string): string[] {
  // Unrealistic example of text being tokenized by spaces
  // In practice, you would use a more sophisticated tokenizer
  // Such as dqbd/tiktoken, xenova, or some HTTP API for tokenizing
  return text.split(' ');
}
