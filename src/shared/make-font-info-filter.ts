import picomatch from "picomatch";
import type { CommonFlags } from "./common-flags";
import type { FontInfo } from "./get-font-infos";

export const DefaultFilter = "*";

export function makeFontInfoFilter(flags: CommonFlags) {
  const matcher = picomatch(flags.globPattern);

  return (fontInfo: FontInfo) => {
    return matcher(fontInfo.name);
  };
}
