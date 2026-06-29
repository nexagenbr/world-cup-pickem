import { copyFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

if (!existsSync(".env.local")) {
  copyFileSync(".env.example", ".env.local");
  console.log("Created .env.local from .env.example");
}

const npmCli = process.env.npm_execpath;
const command = npmCli ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm";
const args = npmCli ? [npmCli, "install", "--no-audit", "--no-fund"] : ["install", "--no-audit", "--no-fund"];
const result = spawnSync(command, args, { stdio: "inherit" });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log("Setup complete. Add credentials to .env.local, apply the Supabase migration, then run npm run dev.");
