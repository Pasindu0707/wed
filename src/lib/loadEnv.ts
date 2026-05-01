import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Load env files for Node/tsx scripts. Next.js reads `.env.local` automatically;
 * dotenv's default `import "dotenv/config"` only loads `.env`, so scripts would miss `MONGODB_URI`.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");

config({ path: path.join(root, ".env.local") });
config({ path: path.join(root, ".env") });
