# Adobe Font Extractor

A command-line utility for managing Adobe fonts on macOS. The Adobe Creative
Cloud app installs fonts in a hidden location on your filesystem and names them
with non-human-readable IDs (like "6a42d5a9.otf"). Adobe Font Extractor helps
you find these fonts, copy them to a location of your choice, and rename them to
their proper, readable names (like "Helvetica-Bold.otf").

## Installation

```bash
npm install -g adobe-font-extractor
```

## Commands

Adobe Font Extractor provides two main commands:

### List Fonts

Lists all installed Adobe fonts with optional filtering.

```bash
adobe-font-extractor list [options]
```

#### List Font Options

| Option                | Alias | Description                                     | Default |
| --------------------- | ----- | ----------------------------------------------- | ------- |
| `--pattern <pattern>` | `-p`  | Filter fonts by glob pattern (should be quoted) | `*`     |
| `--verbosity <level>` | `-v`  | Set the verbosity (silent, error, info, debug)  | `info`  |

#### List Font Examples

```bash
# List all installed Adobe fonts
adobe-font-extractor list

# List fonts matching a pattern
adobe-font-extractor list --pattern="*Bold*"

# List fonts with debug information
adobe-font-extractor list --verbosity=debug
```

### Extract Fonts

Extracts Adobe fonts to a specified destination directory.

```bash
adobe-font-extractor extract [options] <destination>
```

#### Font Extraction Options

| Option                | Alias | Description                                     | Default |
| --------------------- | ----- | ----------------------------------------------- | ------- |
| `--pattern <pattern>` | `-p`  | Filter fonts by glob pattern (should be quoted) | `*`     |
| `--verbosity <level>` | `-v`  | Set the verbosity (silent, error, info, debug)  | `info`  |
| `--force`             | `-f`  | Force overwrite existing files                  | `false` |
| `--dry`               | `-d`  | Dry run, do not copy files                      | `false` |
| `--abort`             | `-a`  | Abort on errors                                 | `false` |

#### Font Extraction Examples

```bash
# Extract all Adobe fonts to a directory
adobe-font-extractor extract ./my-fonts

# Extract only bold fonts
adobe-font-extractor extract --pattern="*Bold*" ./bold-fonts

# Extract fonts with overwrite
adobe-font-extractor extract --force ./my-fonts

# Perform a dry run without copying
adobe-font-extractor extract --dry ./my-fonts
```

## Pattern Matching

The `--pattern` option supports glob patterns for filtering fonts by name:

- `*` - Match any number of characters
- `?` - Match a single character
- `[abc]` - Match one character from the set
- `{pattern1,pattern2}` - Match any of the patterns

Examples:

- `*Bold*` - Match any font with "Bold" in the name
- `Helvetica*` - Match fonts starting with "Helvetica"
- `*{Bold,Italic}*` - Match fonts containing either "Bold" or "Italic"

## Why Extract Adobe Fonts?

This tool is provided for legitimate uses within the terms of your Adobe Fonts
license, such as:

1. Using fonts in applications that don't directly support Adobe Fonts
   integration
2. Creating backups for personal use while you have an active subscription
3. Using fonts on devices where Creative Cloud cannot be installed but your
   license permits usage

**Important Legal Disclaimer:** Users are responsible for ensuring their use of
extracted fonts complies with Adobe's licensing terms. The author of this tool
is not liable for any use that violates Adobe's terms of service or font
licensing agreements. Adobe Fonts typically requires an active subscription for
continued use, and redistribution of fonts is generally prohibited.

## Troubleshooting

### No Fonts Found

If no fonts are found:

1. Ensure you have the Adobe Creative Cloud app installed and running
2. Verify that you have activated fonts on the Adobe fonts website
   ([https://fonts.adobe.com](https://fonts.adobe.com))
3. Check that the default Adobe fonts directory exists:
   - macOS: `~/Library/Application Support/Adobe/CoreSync/plugins/livetype`
4. If your Adobe fonts are in a non-standard location, you can use the hidden
   `--source` option to specify a custom directory:

```bash
adobe-font-extractor list --source="/path/to/fonts"
adobe-font-extractor extract --source="/path/to/fonts" ./my-fonts
```

### Permission Issues

If you encounter permission errors when extracting fonts:

1. Ensure you have write permissions to the destination directory
2. Try running the command with elevated privileges if necessary

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

Copyright 2025 Luca Schultz
