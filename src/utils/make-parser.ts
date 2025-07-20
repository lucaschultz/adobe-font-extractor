import type { InputParser } from "@stricli/core";
import { ArkErrors, type Type } from "arktype";

export function makeParser<T>(schema: Type<T>): InputParser<T> {
  return (value: string) => {
    const result = schema(value);

    if (result instanceof ArkErrors) {
      throw new SyntaxError(result.summary, { cause: result });
    }

    return result as T;
  };
}
