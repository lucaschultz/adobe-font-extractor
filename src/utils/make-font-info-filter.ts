import picomatch from "picomatch";
import type { FontInfo } from "./get-font-infos";

export const DefaultFilter = "*";

export function makeFontInfoFilter(flags: { pattern: string }) {
  const matcher = picomatch(flags.pattern);

  return (fontInfo: FontInfo) => {
    return matcher(fontInfo.name);
  };
}
