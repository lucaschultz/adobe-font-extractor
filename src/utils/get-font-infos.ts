import * as fontkit from "fontkit";
import * as fs from "node:fs/promises";
import path from "node:path";

export interface FontInfo {
  name: string;
  path: string;
}

export async function getFontFontInfos(args: {
  source: string;
}): Promise<Array<FontInfo>> {
  const { source: dir } = args;
  const results: Array<FontInfo> = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await getFontFontInfos({ source: fullPath })));
    } else if (entry.isFile() && /\.(otf|ttf)$/i.test(entry.name)) {
      const fontName = await getFontName(fullPath);

      if (!fontName) {
        continue;
      }

      results.push({ name: fontName, path: fullPath });
    }
  }

  return results;
}

async function getFontName(fontPath: string): Promise<null | string> {
  try {
    const font = await fontkit.open(fontPath);

    if ("postscriptName" in font) {
      return font.postscriptName.trim();
    }

    return null;
  } catch {
    return null;
  }
}
