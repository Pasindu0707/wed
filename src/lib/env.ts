import { z } from "zod";

const EnvSchema = z.object({
  // Intentionally optional at import-time; API routes should throw a clear runtime error if missing.
  MONGODB_URI: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  ALLOW_SEED: z.enum(["0", "1"]).optional().transform((v) => v ?? "0")
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  ALLOW_SEED: process.env.ALLOW_SEED
});

