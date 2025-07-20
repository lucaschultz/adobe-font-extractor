import * as fs from "node:fs/promises";

export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath, fs.constants.F_OK);

    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
