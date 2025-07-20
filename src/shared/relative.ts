import path from "node:path";

export function relative(filePath: string): string {
  return path.relative(process.cwd(), filePath);
}
