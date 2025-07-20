import * as path from "node:path";
import { buildCommand } from "@stricli/core";
import {
  type CommonFlags,
  CommonFlagsAliases,
  CommonFlagsConfig,
} from "../shared/common-flags";
import type { LocalContext } from "../shared/context";
import { copyFile } from "../shared/copy-file";
import { directoryExists } from "../shared/directory-exists";
import { getFontFontInfos } from "../shared/get-font-infos";
import { getPlatform } from "../shared/get-platform";
import { getSource } from "../shared/get-source";
import {
  DefaultFilter,
  makeFontInfoFilter,
} from "../shared/make-font-info-filter";
import { makeLogger, type Summary } from "../shared/make-logger";
import { relative } from "../shared/relative";

interface ExtractCommandFlags extends CommonFlags {
  force: boolean;
  dryRun: boolean;
  abortOnError: boolean;
}

export const extractCommand = buildCommand({
  async func(
    this: LocalContext,
    flags: ExtractCommandFlags,
    targetDir: string,
  ): Promise<void> {
    const start = performance.now();
    const logger = makeLogger(flags.verbosity);

    logger.section("Adobe Font Extractor".toUpperCase());
    logger.newLine();

    const platform = getPlatform();
    if (platform.status === "incompatible") {
      logger.error(platform.message);
      return process.exit(1);
    }

    const source = getSource(platform.name, flags);

    if (!(await directoryExists(source.path))) {
      if (source.type === "custom") {
        logger.error(`Source directory "${source.path}" does not exist`);
      } else {
        logger.error(
          `Font directory "${source.path}" does not exist, make sure you have the Creative Cloud app installed and running.`,
        );
      }

      return process.exit(1);
    }

    logger.task(
      `Searching fonts${flags.sourceDirectory ? ` in ${flags.sourceDirectory}` : ""}`,
    );

    const fontInfos = await getFontFontInfos({
      source: source.path,
    });

    if (fontInfos.length === 0) {
      if (flags.sourceDirectory) {
        logger.error(
          `No fonts found in source directory "${flags.sourceDirectory}"`,
        );
      } else {
        logger.error(
          `No fonts found in default Adobe fonts directory, make sure you have Adobe fonts installed and the Creative Cloud app running.`,
        );
      }

      return process.exit(0);
    }

    const filteredFontInfos = fontInfos.filter(makeFontInfoFilter(flags));

    if (filteredFontInfos.length === 0) {
      logger.warn(
        `No fonts matched filter "${flags.globPattern}" (${fontInfos.length} fonts total)`,
      );

      return process.exit(1);
    }

    logger.success(
      `Found ${filteredFontInfos.length} fonts ${
        flags.globPattern !== DefaultFilter
          ? `matching "${flags.globPattern}" (${fontInfos.length} fonts total)`
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
        targetDir,
        `${fontInfo.name}${fontExtension}`,
      );

      const result = await copyFile({
        src: fontInfo.path,
        dest: fontDestinationPath,
        force: flags.force,
        dryRun: flags.dryRun,
      });

      if (result.status === "success" || result.status === "overridden") {
        successCount++;
        logger.debug(
          `Copied "${fontInfo.name}" to "${relative(fontDestinationPath)}"`,
        );
      } else if (result.status === "skipped") {
        skippedCount++;
        logger.warn(
          `File "${relative(
            fontDestinationPath,
          )}" already exists (use --force to overwrite)`,
        );
      } else if (result.status === "error") {
        errorCount++;
        if (flags.abortOnError) {
          throw result.cause;
        }
        logger.error(
          `Failed to copy "${relative(
            fontDestinationPath,
          )}" (use --abort to abort on errors)`,
        );
      }
    }
    logger.success("Finished copying fonts");

    const { exitCode, summary } = summarize({
      kind: "fonts-processed",
      destination: targetDir,
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
      ...CommonFlagsAliases,
      a: "abortOnError",
      d: "dryRun",
      f: "force",
    },
    flags: {
      ...CommonFlagsConfig,

      abortOnError: {
        kind: "boolean",
        brief: "Abort on recoverable errors",
        default: false,
      },
      force: {
        kind: "boolean",
        brief: "Force overwrite existing files",
        default: false,
      },
      dryRun: {
        kind: "boolean",
        brief: "Dry run, do not copy files",
        default: false,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Directory to copy fonts to",
          parse: String,
          placeholder: "target-directory",
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

interface CommandResult {
  kind: "fonts-processed";
  destination: string;
  fontsFiltered: number;
  fontsCopiedSuccessfully: number;
  fontsSkipped: number;
  copyErrors: number;
  duration: number;
  flags: ExtractCommandFlags;
}

function summarize(result: CommandResult): {
  exitCode: 1 | 0;
  summary: Summary;
} {
  const summary: Summary = [{ type: "section", message: "Summary" }];
  let exitCode: 1 | 0 = 0;

  if (result.flags.dryRun) {
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
        message: `Copied ${fontsCopiedSuccessfully} of ${fontsFiltered} fonts to "${relativeDestination}"`,
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
    message: `Operation took ${result.duration.toFixed(
      2,
    )} ms (verbosity: ${result.flags.verbosity})`,
  });

  return { exitCode, summary };
}
