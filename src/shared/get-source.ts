import * as os from "node:os";
import path from "node:path";
import type { CommonFlags } from "../commands/extract-command";
import type { CompatiblePlatform } from "./get-platform";

interface Source {
  type: "platform-default" | "custom";
  path: string;
}

export function getSource(
  platform: CompatiblePlatform,
  flags: CommonFlags,
): Source {
  if (flags.sourceDirectory) {
    return {
      type: "custom",
      path: path.resolve(flags.sourceDirectory),
    };
  }

  switch (platform) {
    case "darwin":
      return {
        type: "platform-default",
        path: path.join(
          os.homedir(),
          "Library",
          "Application Support",
          "Adobe",
          "CoreSync",
          "plugins",
          "livetype",
        ),
      };
    case "win32":
      return {
        type: "platform-default",
        path: path.join(
          os.homedir(),
          "AppData",
          "Roaming",
          "Adobe",
          "CoreSync",
          "plugins",
          "livetype",
        ),
      };

    default:
      return platform satisfies never;
  }
}
