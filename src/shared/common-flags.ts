import type { Aliases, FlagParametersForType } from "@stricli/core";
import { type } from "arktype";
import type { LocalContext } from "./context";
import { DefaultFilter } from "./make-font-info-filter";
import { type VerbosityLevel, VerbosityLevels } from "./make-logger";
import { makeParser } from "./make-parser";

export interface CommonFlags {
  verbosity: VerbosityLevel;
  sourceDirectory?: string;
  globPattern: string;
}

export const CommonFlagsAliases = {
  g: "globPattern",
  s: "sourceDirectory",
  v: "verbosity",
} satisfies Aliases<keyof CommonFlags & string>;

export const CommonFlagsConfig = {
  verbosity: {
    kind: "enum",
    values: VerbosityLevels,
    brief: "Set the verbosity",
    default: "info",
  },
  sourceDirectory: {
    optional: true,
    kind: "parsed",
    brief: "Custom source directory to search for fonts",
    parse: makeParser(type("string")),
    placeholder: "source",
    hidden: true,
  },
  globPattern: {
    kind: "parsed",
    brief: "Filter fonts by glob pattern (must be quoted)",
    placeholder: "pattern",
    default: `${DefaultFilter}`,
    parse: makeParser(type("string")),
  },
} satisfies FlagParametersForType<CommonFlags, LocalContext>;
