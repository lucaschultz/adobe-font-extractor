import { buildCommand } from "@stricli/core";
import { type } from "arktype";
import * as path from "node:path";
import picomatch from "picomatch";
import { DefaultFilter, DefaultFontDirectory } from "../constants";
import type { LocalContext } from "../context";
import { copyFile } from "../utils/copy-file";
import { directoryExists } from "../utils/directory-exists";
import { getFontFontInfos } from "../utils/get-font-infos";
import {
  makeLogger,
  type Summary,
  type VerbosityLevel,
  VerbosityLevels,
} from "../utils/make-logger";
import { makeParser } from "../utils/make-parser";
import { relative } from "../utils/relative";

interface Flags {
  force: boolean;
  dry: boolean;
  verbosity: VerbosityLevel;
  source?: string;
  pattern: string;
  abort: boolean;
}

export const extractCommand = buildCommand({
  async func(
    this: LocalContext,
    flags: Flags,
    destination: string,
  ): Promise<void> {
    const start = performance.now();
    const logger = makeLogger(flags.verbosity);
    logger.section("Adobe Font Extractor".toUpperCase());
    logger.newLine();

    if (!(await directoryExists(flags.source ?? DefaultFontDirectory))) {
      if (!flags.source) {
        logger.error(
          `Default Adobe fonts directory "${DefaultFontDirectory}" does not exist`,
        );
      } else {
        logger.error(`Source directory "${flags.source}" does not exist`);
      }

      return process.exit(1);
    }

    logger.task(`Searching fonts${flags.source ? ` in ${flags.source}` : ""}`);

    const fontInfos = await getFontFontInfos({
      source: flags.source ?? DefaultFontDirectory,
    });

    if (fontInfos.length === 0) {
      if (flags.source) {
        logger.error(`No fonts found in source directory "${flags.source}"`);
      } else {
        logger.error(
          `No fonts found in default Adobe fonts directory, make sure you have Adobe fonts installed and the Creative Cloud app running.`,
        );
      }

      return process.exit(0);
    }

    const matcher = picomatch(flags.pattern);
    const filteredFontInfos = fontInfos.filter((fontInfo) =>
      matcher(fontInfo.name)
    );

    if (filteredFontInfos.length === 0) {
      logger.warn(
        `No fonts matched filter "${flags.pattern}" (${fontInfos.length} fonts total)`,
      );

      return process.exit(1);
    }

    logger.success(
      `Found ${filteredFontInfos.length} fonts ${
        flags.pattern !== DefaultFilter
          ? `matching "${flags.pattern}" (${fontInfos.length} fonts total)`
          : ""
      }`,
    );

    logger.task(`Copying fonts`);
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    for (const fontInfo of filteredFontInfos) {
      const fontExtension = path.extname(fontInfo.path);
      const fontDestinationPath = path.join(
        destination,
        `${fontInfo.name}${fontExtension}`,
      );

      const result = await copyFile({
        src: fontInfo.path,
        dest: fontDestinationPath,
        force: flags.force,
        dryRun: flags.dry,
      });

      if (result.status === "success" || result.status === "overridden") {
        successCount++;
        logger.debug(
          `Copied "${fontInfo.name}" to "${relative(fontDestinationPath)}"`,
        );
      } else if (result.status === "skipped") {
        skippedCount++;
        logger.warn(
          `File "${
            relative(fontDestinationPath)
          }" already exists (use --force to overwrite)`,
        );
      } else if (result.status === "error") {
        errorCount++;
        if (flags.abort) {
          throw result.cause;
        }
        logger.error(
          `Failed to copy "${
            relative(fontDestinationPath)
          }" (use --abort to stop on errors)`,
        );
      }
    }
    logger.success("Finished copying fonts");

    const { exitCode, summary } = summarize({
      kind: "fonts-processed",
      destination,
      fontsFiltered: filteredFontInfos.length,
      fontsCopiedSuccessfully: successCount,
      fontsSkipped: skippedCount,
      copyErrors: errorCount,
      duration: performance.now() - start,
      flags,
    });

    logger.summary(summary);
    return process.exit(exitCode);
  },
  parameters: {
    aliases: {
      p: "pattern",
      s: "source",
      v: "verbosity",
      a: "abort",
      d: "dry",
      f: "force",
    },
    flags: {
      source: {
        optional: true,
        kind: "parsed",
        brief: "Custom source directory to search for fonts",
        parse: makeParser(type("string")),
        placeholder: "source",
        hidden: true,
      },
      abort: {
        kind: "boolean",
        brief: "Abort on errors",
        default: false,
      },
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
      force: {
        kind: "boolean",
        brief: "Force overwrite existing files",
        default: false,
      },
      dry: {
        kind: "boolean",
        brief: "Dry run, do not copy files",
        default: false,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Destination",
          parse: String,
          placeholder: "destination",
        },
      ],
    },
  },
  docs: {
    brief: "Extract installed Adobe fonts",
    fullDescription:
      "Extracts installed Adobe fonts to a specified destination directory. If a font is missing, make sure it is installed on the Adobe fonts site (https://fonts.adobe.com) and that the Creative Cloud app is installed and running.",
  },
});

type CommandResult = {
  kind: "fonts-processed";
  destination: string;
  fontsFiltered: number;
  fontsCopiedSuccessfully: number;
  fontsSkipped: number;
  copyErrors: number;
  duration: number;
  flags: Flags;
};

function summarize(result: CommandResult): {
  exitCode: 1 | 0;
  summary: Summary;
} {
  const summary: Summary = [{ type: "section", message: "Summary" }];
  let exitCode: 1 | 0 = 0;

  if (result.flags.dry) {
    summary.push({
      type: "info",
      message: "Dry run, no files were copied",
    });
  }

  switch (result.kind) {
    case "fonts-processed": {
      const {
        destination,
        fontsFiltered,
        fontsCopiedSuccessfully,
        fontsSkipped,
        copyErrors,
        flags,
      } = result;

      const relativeDestination = relative(destination);

      summary.push({
        type: "info",
        message:
          `Copied ${fontsCopiedSuccessfully} of ${fontsFiltered} fonts to "${relativeDestination}"`,
      });

      if (fontsSkipped > 0) {
        summary.push({
          type: "info",
          message: `${fontsSkipped} font${
            fontsSkipped === 1 ? "" : "s"
          } skipped (already exist${
            flags.force ? "ed and were overwritten" : ""
          })`,
        });
      }

      if (copyErrors > 0) {
        summary.push({
          type: "error",
          message: `Failed to copy ${copyErrors} font${
            copyErrors === 1 ? "" : "s"
          } due to errors`,
        });
      }

      if (copyErrors > 0 && fontsCopiedSuccessfully === 0) {
        exitCode = 1;
      } else {
        exitCode = 0;
      }

      break;
    }
  }

  summary.push({
    type: "info",
    message: `Operation took ${
      result.duration.toFixed(2)
    } ms (verbosity: ${result.flags.verbosity})`,
  });

  return { exitCode, summary };
}
