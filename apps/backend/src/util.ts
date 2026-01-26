import { readFileSync } from "fs";
import { join } from "path";

/**
 * Reads a file as UTF-8 text from a path relative to the caller's directory.
 * @param relativePath Path relative to the caller's directory (e.g., './db-schema.sql')
 * @param baseDir __dirname of the caller (default: process.cwd())
 */
export function readTextFile(
  relativePath: string,
  baseDir: string = process.cwd(),
): string {
  const filePath = join(baseDir, relativePath);
  return readFileSync(filePath, "utf-8");
}
