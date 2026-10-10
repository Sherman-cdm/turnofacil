import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    GEMINI_API_KEY: z.string().min(20).optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    // Kept for compatibility; configured with a modern publishable key.
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  },
  runtimeEnv: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  emptyStringAsUndefined: true,
});
