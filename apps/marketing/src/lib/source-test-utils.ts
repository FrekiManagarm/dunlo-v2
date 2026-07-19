import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MARKETING_ROOT = resolve(process.cwd(), "apps/marketing");

export function readMarketingSource(sourcePath: string): string {
  return readFileSync(resolve(MARKETING_ROOT, sourcePath), "utf8");
}
