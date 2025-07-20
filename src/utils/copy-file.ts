import * as fs from "node:fs/promises";
import path from "node:path";

async function optional(
  dryRun: boolean,
  action: () => Promise<void>,
): Promise<void> {
  if (dryRun) {
    return;
  }

  await action();
}

export async function copyFile(args: {
  src: string;
  dest: string;
  force: boolean;
  dryRun: boolean;
}): Promise<
  | { status: "success" | "skipped" | "overridden" }
  | { status: "error"; cause: unknown }
> {
  try {
    const { force, dryRun, dest, src } = args;

    const exists = await fileExists(dest);

    await optional(dryRun, async () => {
      await fs.mkdir(path.dirname(dest), { recursive: true });
    });

    if (exists) {
      if (!force) {
        return { status: "skipped" };
      }

      await optional(dryRun, async () => {
        await fs.copyFile(src, dest);
      });

      return { status: "overridden" };
    }

    await optional(dryRun, async () => {
      await fs.copyFile(src, dest);
    });

    return { status: "success" };
  } catch (err) {
    return { status: "error", cause: err };
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);

    // Additional check to ensure it's a file
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
