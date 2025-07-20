#!/usr/bin/env node

import { proposeCompletions } from "@stricli/core";
import { app } from "../app";
import { buildContext } from "../context";

const inputs = process.argv.slice(3);

// biome-ignore lint/complexity/useLiteralKeys: The property is from an index signature.
if (process.env["COMP_LINE"]?.endsWith(" ")) {
  inputs.push("");
}
await proposeCompletions(app, inputs, buildContext(process));
try {
  for (
    const { completion } of await proposeCompletions(
      app,
      inputs,
      buildContext(process),
    )
  ) {
    process.stdout.write(`${completion}\n`);
  }
} catch {
  // ignore
}
