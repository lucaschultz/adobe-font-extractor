import { buildCommand } from "@stricli/core";
import { type } from "arktype";
import picomatch from "picomatch";
import { DefaultFilter, DefaultFontDirectory } from "../constants";
import type { LocalContext } from "../context";
import { directoryExists } from "../utils/directory-exists";
import { getFontFontInfos } from "../utils/get-font-infos";
import {
  makeLogger,
  type VerbosityLevel,
  VerbosityLevels,
} from "../utils/make-logger";
import { makeParser } from "../utils/make-parser";

interface Flags {
  verbosity: VerbosityLevel;
  source?: string;
  pattern: string;
}

export const listCommand = buildCommand({
  async func(this: LocalContext, flags: Flags): Promise<void> {
    const logger = makeLogger(flags.verbosity);
    logger.section("List Adobe Fonts".toUpperCase());
    logger.newLine();

    if (!(await directoryExists(flags.source ?? DefaultFontDirectory))) {
      if (flags.source) {
        logger.error(`Source directory "${flags.source}" does not exist`);
      } else {
        logger.error(
          `Adobe font directory does not exist, make sure you have the Creative Cloud app installed.`,
        );
      }
      return process.exit(1);
    }

    const fontInfos = await getFontFontInfos({
      source: flags.source ?? DefaultFontDirectory,
    });

    if (fontInfos.length === 0) {
      logger.warn(
        "No fonts found in the source directory, make sure you have Adobe fonts installed.",
      );
      return process.exit(0);
    }

    const filterMatcher = picomatch(flags.pattern || DefaultFilter);
    const filteredFontInfos = fontInfos.filter((fontInfo) =>
      filterMatcher(fontInfo.name)
    );

    if (filteredFontInfos.length === 0) {
      logger.warn(
        `No fonts matched the filter "${flags.pattern}" (${fontInfos.length} fonts total)`,
      );
      process.exit(1);
    }

    filteredFontInfos.forEach((fontInfo) => {
      logger.log("error", `- ${fontInfo.name}`);
    });
  },
  parameters: {
    aliases: { p: "pattern", s: "source", v: "verbosity" },
    flags: {
      pattern: {
        kind: "parsed",
        brief: "Filter fonts by glob pattern (should be quoted)",
        placeholder: "pattern",
        default: `${DefaultFilter}`,
        parse: makeParser(type("string")),
      },
      verbosity: {
        kind: "enum",
        values: VerbosityLevels,
        brief: "Set the verbosity",
        default: "info",
      },
      source: {
        optional: true,
        kind: "parsed",
        brief: "Custom source directory to search for fonts",
        parse: makeParser(type("string")),
        placeholder: "source",
        hidden: true,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: "List installed Adobe fonts",
    fullDescription:
      "List installed Adobe fonts. If a font is missing, make sure it is installed on the Adobe fonts site (https://fonts.adobe.com) and that the Creative Cloud app is installed and running.",
  },
});
