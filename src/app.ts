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
    hideRoute: {
      install: true,
      uninstall: true,
    },
  },
});

export const app = buildApplication(routes, {
  name,
  versionInfo: {
    currentVersion: version,
  },
});
