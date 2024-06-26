import { experimental_generateObject } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

async function main() {
  const result = await experimental_generateObject({
    model: mistral('mistral-large-latest'),
    schema: z.object({
      characters: z.array(
        z.object({
          name: z.string(),
          class: z
            .string()
            .describe('Character class, e.g. warrior, mage, or thief.'),
          description: z.string(),
        }),
      ),
    }),
    mode: 'tool',
    prompt:
      'Generate 3 character descriptions for a fantasy role playing game.',
  });

  console.log(JSON.stringify(result.object, null, 2));
}

main().catch(console.error);
