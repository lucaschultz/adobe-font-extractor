export const VerbosityLevels = ["silent", "error", "info", "debug"] as const;

export type VerbosityLevel = (typeof VerbosityLevels)[number];

type LogLevel = Exclude<VerbosityLevel, "silent">;

function levels(levels: ReadonlyArray<LogLevel>): ReadonlyArray<LogLevel> {
  return levels;
}

interface SummaryItem {
  type: "info" | "error" | "section" | "warn";
  message: string;
}

export type Summary = Array<SummaryItem>;

interface Logger {
  log: (level: LogLevel, message: string) => void;
  section: (message: string) => void;
  task: (message: string) => void;
  success: (message: string) => void;
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  summary: (summary: Summary) => void;
  newLine: () => void;
}

export function makeLogger(verbosity: VerbosityLevel): Logger {
  function shouldLog(level: LogLevel): boolean {
    switch (verbosity) {
      case "silent":
        return false;
      case "error":
        return levels(["error"]).includes(level);
      case "info":
        return levels(["error", "info"]).includes(level);
      case "debug":
        return levels(["error", "info", "debug"]).includes(level);
      default:
        return verbosity satisfies never;
    }
  }

  let _lastWasNewLine = true; // Start with true to avoid initial newline

  return {
    newLine() {
      if (!_lastWasNewLine) {
        console.log();
        _lastWasNewLine = true;
      }
    },
    log(level: LogLevel, message: string) {
      if (shouldLog(level)) {
        console.log(message);
        _lastWasNewLine = false;
      }
    },

    section(message: string) {
      this.newLine();
      this.log("info", `# ${message}`);
    },

    task(message: string) {
      this.newLine();
      this.log("info", `${message}${message.endsWith("...") ? "" : "..."}`);
    },

    success(message: string) {
      this.log("info", `[+] ${message}`);
    },

    debug(message: string) {
      this.log("debug", `[#] ${message}`);
    },

    info(message: string) {
      this.log("info", `[i] ${message}`);
    },

    warn(message: string) {
      this.log("info", `[!] ${message}`);
    },

    error(message: string) {
      this.log("error", `[-] ${message}`);
    },

    summary(summary: Summary) {
      summary.forEach((item) => {
        switch (item.type) {
          case "info":
            return this.info(item.message);
          case "error":
            return this.error(item.message);
          case "section":
            return this.section(item.message);
          case "warn":
            return this.warn(item.message);
          default:
            return item.type satisfies never;
        }
      });
    },
  };
}
