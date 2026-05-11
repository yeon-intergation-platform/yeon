import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import readline from "node:readline";

const rootDir = process.cwd();
const backendDir = join(rootDir, "apps", "backend");
const isWindows = process.platform === "win32";
const portArgIndex = process.argv.indexOf("--port");
const port =
  portArgIndex >= 0 && process.argv[portArgIndex + 1]
    ? process.argv[portArgIndex + 1]
    : process.env.BACKEND_PORT ||
      process.env.SERVER_PORT ||
      process.env.PORT ||
      "8080";

let shuttingDown = false;
let sawFailure = false;
const children = new Map();

function fileExists(path) {
  return existsSync(path);
}

function resolveGradleCommand() {
  if (isWindows) {
    if (fileExists(join(backendDir, "gradlew.bat"))) return "gradlew.bat";
    if (fileExists(join(backendDir, "gradlew"))) return "./gradlew";
  }

  if (fileExists(join(backendDir, "gradlew"))) return "./gradlew";
  if (fileExists(join(backendDir, "gradlew.bat"))) return "gradlew.bat";
  return "gradle";
}

function logLine(service, message, stream = "stdout") {
  const tag = stream === "stderr" ? "!" : ">";
  process.stdout.write(`[backend:${service}:${tag}] ${message}\n`);
}

function attachLines(service, stream, streamName) {
  const rl = readline.createInterface({ input: stream });
  rl.on("line", (line) => logLine(service, line, streamName));
}

function spawnGradle(name, args) {
  const gradleCommand = resolveGradleCommand();
  const child = spawn(gradleCommand, args, {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: String(port),
      SERVER_PORT: String(port),
      BACKEND_PORT: String(port),
      SPRING_DEVTOOLS_RESTART_ENABLED: "true",
    },
    stdio: ["ignore", "pipe", "pipe"],
    detached: !isWindows,
  });

  children.set(name, child);
  attachLines(name, child.stdout, "stdout");
  attachLines(name, child.stderr, "stderr");

  child.on("exit", (code, signal) => {
    children.delete(name);

    if (shuttingDown) {
      if (children.size === 0) process.exit(sawFailure ? 1 : 0);
      return;
    }

    const exitReason = signal
      ? `signal ${signal}`
      : `code ${code === null ? "null" : code}`;

    if (code && code !== 0) {
      sawFailure = true;
      logLine(name, `프로세스가 ${exitReason}로 종료되었습니다.`, "stderr");
    } else {
      logLine(name, `프로세스가 ${exitReason}로 종료되었습니다.`);
    }

    stopChildren(code && code !== 0 ? "SIGTERM" : "SIGINT");
  });

  child.on("error", (error) => {
    sawFailure = true;
    logLine(name, `프로세스를 시작하지 못했습니다: ${error.message}`, "stderr");
    stopChildren("SIGTERM");
  });

  return child;
}

function stopChildren(signal = "SIGINT") {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children.values()) {
    try {
      if (!isWindows && child.pid) {
        process.kill(-child.pid, signal);
      } else {
        child.kill(signal);
      }
    } catch {
      try {
        child.kill(signal);
      } catch {
        // no-op
      }
    }
  }

  setTimeout(() => {
    for (const child of children.values()) {
      try {
        if (!isWindows && child.pid) {
          process.kill(-child.pid, "SIGKILL");
        } else {
          child.kill("SIGKILL");
        }
      } catch {
        try {
          child.kill("SIGKILL");
        } catch {
          // no-op
        }
      }
    }
  }, 2_000).unref();

  if (children.size === 0) {
    process.exit(sawFailure ? 1 : 0);
  }
}

process.on("SIGINT", () => stopChildren("SIGINT"));
process.on("SIGTERM", () => stopChildren("SIGTERM"));

logLine(
  "dev",
  `Spring DevTools 자동 재시작용 classpath 감시를 시작합니다. port=${port}`
);
spawnGradle("classes", ["classes", "--continuous", "-x", "test"]);
spawnGradle("bootRun", ["bootRun", `--args=--server.port=${port}`]);
