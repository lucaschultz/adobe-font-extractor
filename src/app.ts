import {
  buildInstallCommand,
  buildUninstallCommand,
} from "@stricli/auto-complete";
import { buildApplication, buildRouteMap } from "@stricli/core";
import { description, name, version } from "../package.json";
import { extractCommand } from "./commands/extract-command";
import { listCommand } from "./commands/list-command";

const routes = buildRouteMap({
  routes: {
    extract: extractCommand,
    list: listCommand,
    install: buildInstallCommand("adobe-font-extractor", {
      bash: "__adobe-font-extractor_bash_complete",
    }),
    uninstall: buildUninstallCommand("adobe-font-extractor", { bash: true }),
  },
  docs: {
    brief: description,
    fullDescription:
      "Lists and extracts installed Adobe fonts. If a font is missing, make sure it is installed on the Adobe fonts site (https://fonts.adobe.com) and that the Creative Cloud app is installed and running.",
    hideRoute: {
      install: true,
      uninstall: true,
    },
  },
});

export const app = buildApplication(routes, {
  name,
  scanner: {
    caseStyle: "allow-kebab-for-camel",
  },
  documentation: {
    caseStyle: "convert-camel-to-kebab",
    disableAnsiColor: true,
    useAliasInUsageLine: true,
  },
  versionInfo: {
    currentVersion: version,
  },
});
