import os from "node:os";
import path from "node:path";

export const DefaultFontDirectory = path.join(
  os.homedir(),
  "/Library/Application Support/Adobe/CoreSync/plugins/livetype",
);

export const DefaultFilter = "*";
