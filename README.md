# Adobe Font Extractor

A command-line utility for extracting Adobe fonts on macOS and Windows. This
tool is provided for legitimate uses within the terms of your Adobe Fonts
license, such as:

1. Using fonts in applications that don't directly support Adobe Fonts
   integration
2. Creating backups for personal use while you have an active subscription
3. Using fonts on devices where Creative Cloud cannot be installed but your
   license permits usage

## Installation

```bash
npm install -g adobe-font-extractor
```

## How Does It Work?

The Adobe Creative Cloud app installs fonts in a hidden location on your
filesystem and names them with non-human-readable IDs (like `2.otf`). Adobe Font
Extractor helps you find these fonts, copy them to a location of your choice,
and rename them to their
[PostScript](https://en.wikipedia.org/wiki/PostScript_fonts) name (like
"Helvetica-Bold.otf") that is usually embedded in the file.

In summary, Adobe Font Extractor searches, renames and copies fonts which are
already on your filesystem. It does not download or install new fonts from
Adobe. It simply makes it easier to access and use the fonts.

### Legal Disclaimer

Users are responsible for ensuring their use of extracted fonts complies with
Adobe's licensing terms. The author of this tool is not liable for any use that
violates Adobe's terms of service or font licensing agreements. Adobe Fonts
typically requires an active subscription for continued use, and redistribution
of fonts is generally prohibited.

## Commands

Adobe Font Extractor provides two main commands:

### List Fonts

Lists all installed Adobe fonts with optional filtering.

```bash
adobe-font-extractor list [options]
```

#### List Font Options

| Option                     | Alias | Description                                            | Default |
| -------------------------- | ----- | ------------------------------------------------------ | ------- |
| `--verbosity <level>`      | `-v`  | Set the verbosity (`silent`, `error`, `info`, `debug`) | `info`  |
| `--glob-pattern <pattern>` | `-g`  | Filter fonts by glob pattern (must be quoted)          | `*`     |

#### List Font Examples

```bash
# List all installed Adobe fonts
adobe-font-extractor list

# List fonts matching a pattern
adobe-font-extractor list --glob-pattern="*Bold*"

# List fonts with debug information
adobe-font-extractor list --verbosity=debug
```

### Extract Fonts

Extracts Adobe fonts to a specified destination directory.

```bash
adobe-font-extractor extract [options] <destination>
```

#### Font Extraction Options

| Option                     | Alias | Description                                            | Default |
| -------------------------- | ----- | ------------------------------------------------------ | ------- |
| `--verbosity <level>`      | `-v`  | Set the verbosity (`silent`, `error`, `info`, `debug`) | `info`  |
| `--glob-pattern <pattern>` | `-g`  | Filter fonts by glob pattern (must be quoted)          | `*`     |
| `--abort-on-error`         | `-a`  | Abort on recoverable errors                            | `false` |
| `--force`                  | `-f`  | Force overwrite existing files                         | `false` |
| `--dry-run`                | `-d`  | Dry run, do not copy files                             | `false` |

#### Font Extraction Examples

```bash
# Extract all Adobe fonts to a directory
adobe-font-extractor extract ./my-fonts

# Extract only bold fonts
adobe-font-extractor extract --glob-pattern="*Bold*" ./bold-fonts

# Extract fonts with overwrite
adobe-font-extractor extract --force ./my-fonts

# Perform a dry run without copying
adobe-font-extractor extract --dry-run-run ./my-fonts
```

## Pattern Matching

The `--glob-pattern` option supports glob patterns for filtering fonts by their
PostScript name:

- `*` - Match any number of characters
- `?` - Match a single character
- `[abc]` - Match one character from the set
- `{pattern1,pattern2}` - Match any of the patterns

Examples:

- `*Bold*` - Match any font with "Bold" in the name
- `Helvetica*` - Match fonts starting with "Helvetica"
- `*{Bold,Italic}*` - Match fonts containing either "Bold" or "Italic"

Please note that the pattern must be quoted to prevent shell expansion (e.g.,
`-g "*Bold*"` instead of `-g *Bold*`).

## Troubleshooting

### No Fonts Found

If no fonts are found:

1. Ensure you have the Adobe Creative Cloud app installed and running
2. Verify that you have activated fonts on the Adobe fonts website
   ([https://fonts.adobe.com](https://fonts.adobe.com))
3. Check that the default Adobe fonts directory exists:
   - macOS: `~/Library/Application Support/Adobe/CoreSync/plugins/livetype`
4. If your Adobe fonts are in a non-standard location, you can use the hidden
   `--source-directory` option to specify a custom directory to search for
   fonts:

```bash
adobe-font-extractor list --source-directory="/path/to/fonts"
adobe-font-extractor extract --source-directory="/path/to/fonts" ./my-fonts
```

### Permission Issues

If you encounter permission errors when extracting fonts:

1. Ensure you have write permissions to the destination directory
2. Try running the command with elevated privileges if necessary

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

Copyright 2025 Luca Schultz
