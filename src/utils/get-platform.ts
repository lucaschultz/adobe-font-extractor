import { ArkErrors, type } from "arktype";
import * as os from "node:os";

const CompatiblePlatform = type("'darwin' | 'win32'");

export type CompatiblePlatform = typeof CompatiblePlatform.infer;

export function getPlatform(): {
  status: "compatible";
  name: CompatiblePlatform;
} | { status: "incompatible"; message: string } {
  const platform = CompatiblePlatform(os.platform());

  if (platform instanceof ArkErrors) {
    return {
      status: "incompatible",
      message: platform.summary,
    };
  }

  return {
    status: "compatible",
    name: platform,
  };
}
