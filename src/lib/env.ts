import { z } from 'zod/v4';

const envSchema = z.object({
  DATABASE_URL: z.string().default('./data/psychiatry.db'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  AUTH_URL: z.url().optional(),
  AUTH_TRUST_HOST: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  OPENAI_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  TRANSCRIPTION_PROVIDER: z.enum(['mock', 'whisper']).default('mock'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('PsychScribe'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.issues, null, 2));
    throw new Error('Invalid environment variables');
  }
  return result.data;
}

export const env = validateEnv();
