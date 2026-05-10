import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// 加载环境变量
config({ path: "../.env" });

export default {
  schema: "./src/schemas/*.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
