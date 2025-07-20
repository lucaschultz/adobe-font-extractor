import { buildCommand } from "@stricli/core";
import { version } from "../../package.json";
import {
  type CommonFlags,
  CommonFlagsAliases,
  CommonFlagsConfig,
} from "../shared/common-flags";
import type { LocalContext } from "../shared/context";
import { directoryExists } from "../shared/directory-exists";
import { getFontFontInfos } from "../shared/get-font-infos";
import { getPlatform } from "../shared/get-platform";
import { getSource } from "../shared/get-source";
import { makeFontInfoFilter } from "../shared/make-font-info-filter";
import { makeLogger } from "../shared/make-logger";

interface ListCommandFlags extends CommonFlags {}

export const listCommand = buildCommand({
  async func(this: LocalContext, flags: ListCommandFlags): Promise<void> {
    const logger = makeLogger(flags.verbosity);

    logger.section(`${"Adobe Font Extractor".toUpperCase()} v${version}`);
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

    const fontInfos = await getFontFontInfos({
      source: source.path,
    });

    if (fontInfos.length === 0) {
      logger.warn(
        "No fonts found in the source directory, make sure you have Adobe fonts installed.",
      );
      return process.exit(0);
    }

    const filteredFontInfos = fontInfos.filter(makeFontInfoFilter(flags));

    if (filteredFontInfos.length === 0) {
      logger.warn(
        `No fonts matched the filter "${flags.globPattern}" (${fontInfos.length} fonts total)`,
      );
      process.exit(1);
    }

    filteredFontInfos.forEach((fontInfo) => {
      logger.log("error", `- ${fontInfo.name}`);
    });
  },
  parameters: {
    aliases: { ...CommonFlagsAliases },
    flags: {
      ...CommonFlagsConfig,
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
