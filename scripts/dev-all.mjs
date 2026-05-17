import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import readline from "node:readline";
import { findAvailablePort, normalizePort } from "./dev-ports.mjs";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const isWindows = process.platform === "win32";
const rootDir = process.cwd();
const backendDir = join(rootDir, "apps", "backend");
const backendDevRunnerPath = join(rootDir, "scripts", "dev-backend.mjs");
const useLegacyMode = process.argv.includes("--legacy");
const reset = "\x1b[0m";

const children = new Map();
let shuttingDown = false;
let sawFailure = false;
const webLockPath = join(rootDir, "apps", "web", ".next", "dev", "lock");
const defaultLocalSpringInternalToken = "local-dev-internal-token";
const defaultLocalAuthSecret = "local-dev-auth-secret";
const defaultLocalSpringProfile = "dev.local";

const portSources = {
  web: ["WEB_PORT", "PORT"],
  backend: ["BACKEND_PORT", "SERVER_PORT", "PORT"],
  mobile: ["MOBILE_PORT", "EXPO_DEV_SERVER_PORT", "PORT"],
  race: ["RACE_SERVER_PORT", "PORT"],
};

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function logLine(service, message, stream = "stdout") {
  const streamTag = stream === "stderr" ? "!" : ">";
  process.stdout.write(
    `${service.color}[${service.name}:${streamTag}]${reset} ${message}\n`
  );
}

function attachLines(service, stream, streamName) {
  const rl = readline.createInterface({ input: stream });
  rl.on("line", (line) => {
    logLine(service, line, streamName);
  });
}

function fileExists(path) {
  return existsSync(path);
}

function readDotenv(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        const rawValue = valueParts.join("=");
        return [key.trim(), rawValue.trim().replace(/^['"]|['"]$/g, "")];
      })
  );
}

const localEnvFilePaths = [
  join(rootDir, ".env"),
  join(rootDir, ".env.local"),
  join(rootDir, "apps", "backend", ".env"),
  join(rootDir, "apps", "backend", ".env.local"),
  join(rootDir, "apps", "web", ".env"),
  join(rootDir, "apps", "web", ".env.local"),
];

function resolveLocalEnvValue(name) {
  const fromProcess = process.env[name]?.trim();
  if (fromProcess) return fromProcess;

  for (const envFilePath of localEnvFilePaths) {
    const value = readDotenv(envFilePath)[name]?.trim();
    if (value) return value;
  }

  return null;
}

function resolveLocalDatabaseUrl() {
  return resolveLocalEnvValue("DATABASE_URL");
}

function toDatabaseEnv(databaseUrl) {
  return databaseUrl ? { DATABASE_URL: databaseUrl } : {};
}

function toOptionalEnv(names) {
  return Object.fromEntries(
    names
      .map((name) => [name, resolveLocalEnvValue(name)])
      .filter(([, value]) => value !== null)
  );
}

function resolveRootAuthProviderEnv() {
  return toOptionalEnv([
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "KAKAO_REST_API_KEY",
    "KAKAO_CLIENT_SECRET",
  ]);
}

function getPidCommandLine(pid) {
  if (isWindows) {
    return "";
  }

  const result = spawnSync("ps", ["-p", String(pid), "-o", "command="], {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return "";
  }

  return (result.stdout || "").trim();
}

function ensureWebLockSafe() {
  if (!existsSync(webLockPath)) {
    return;
  }

  let lock;
  try {
    lock = JSON.parse(readFileSync(webLockPath, "utf8"));
  } catch {
    try {
      unlinkSync(webLockPath);
    } catch {
      // lock 파일이 손상되어 있어도 다음 실행에서 다시 판단할 수 있도록 제거만 시도합니다.
    }
    return;
  }

  const lockPid = Number.parseInt(lock?.pid, 10);
  const lockCommandLine = getPidCommandLine(lockPid);
  const isNextServerPid =
    Number.isInteger(lockPid) &&
    lockPid > 0 &&
    /\b(next-server|next)\b/.test(lockCommandLine) &&
    /(\bdev\b|--args=--server\.port=|next-server)/.test(lockCommandLine);

  if (isNextServerPid) {
    try {
      process.kill(lockPid, "SIGTERM");
    } catch (error) {
      // 이미 종료된 상태거나 접근 권한이 없는 경우는 다음 단계에서 lock만 정리합니다.
      logLine(
        {
          name: "dev-all",
          color: "\x1b[33m",
        },
        `웹 락 대상 PID 종료 시도 실패: ${error.message}`
      );
    }

    setTimeout(() => {
      try {
        process.kill(lockPid, "SIGKILL");
      } catch {
        // no-op
      }
    }, 800).unref();
  }

  try {
    unlinkSync(webLockPath);
  } catch {
    // lock 파일이 보호되어 있으면 다음 실행에서 다시 판단하도록 둡니다.
  }
}

function resolveInitialPort(serviceKey, fallbackPort) {
  for (const envName of portSources[serviceKey] || []) {
    const candidate = normalizePort(process.env[envName], NaN);

    if (Number.isInteger(candidate)) {
      return candidate;
    }
  }

  return fallbackPort;
}

function resolveBackendRunner(basePort) {
  const gradleRunner = {
    command: process.execPath,
    args: [backendDevRunnerPath, `--port`, String(basePort)],
    cwd: rootDir,
    env: {
      PORT: String(basePort),
      SERVER_PORT: String(basePort),
      BACKEND_PORT: String(basePort),
    },
  };
  const gradleBat = {
    command: process.execPath,
    args: [backendDevRunnerPath, `--port`, String(basePort)],
    cwd: rootDir,
    env: {
      PORT: String(basePort),
      SERVER_PORT: String(basePort),
      BACKEND_PORT: String(basePort),
    },
  };
  const mavenRunner = {
    command: "./mvnw",
    args: [
      "spring-boot:run",
      `-Dspring-boot.run.arguments=--server.port=${basePort}`,
    ],
    cwd: backendDir,
    env: {
      PORT: String(basePort),
      SERVER_PORT: String(basePort),
      BACKEND_PORT: String(basePort),
    },
  };
  const mavenBat = {
    command: "mvnw.cmd",
    args: [
      "spring-boot:run",
      `-Dspring-boot.run.arguments=--server.port=${basePort}`,
    ],
    cwd: backendDir,
    env: {
      PORT: String(basePort),
      SERVER_PORT: String(basePort),
      BACKEND_PORT: String(basePort),
    },
  };

  if (isWindows) {
    if (fileExists(join(backendDir, "gradlew.bat"))) {
      return gradleBat;
    }
    if (fileExists(join(backendDir, "gradlew"))) {
      return gradleRunner;
    }
    if (fileExists(join(backendDir, "mvnw.cmd"))) {
      return mavenBat;
    }
    if (fileExists(join(backendDir, "mvnw"))) {
      return mavenRunner;
    }
  } else {
    if (fileExists(join(backendDir, "gradlew"))) {
      return gradleRunner;
    }
    if (fileExists(join(backendDir, "mvnw"))) {
      return mavenRunner;
    }
    if (fileExists(join(backendDir, "gradlew.bat"))) {
      return gradleBat;
    }
    if (fileExists(join(backendDir, "mvnw.cmd"))) {
      return mavenBat;
    }
  }

  if (
    fileExists(join(backendDir, "build.gradle")) ||
    fileExists(join(backendDir, "build.gradle.kts"))
  ) {
    return {
      command: process.execPath,
      args: [backendDevRunnerPath, `--port`, String(basePort)],
      cwd: rootDir,
      env: {
        PORT: String(basePort),
        SERVER_PORT: String(basePort),
        BACKEND_PORT: String(basePort),
      },
    };
  }

  if (fileExists(join(backendDir, "pom.xml"))) {
    return {
      command: "mvn",
      args: [
        "spring-boot:run",
        `-Dspring-boot.run.arguments=--server.port=${basePort}`,
      ],
      cwd: backendDir,
      env: {
        PORT: String(basePort),
        SERVER_PORT: String(basePort),
        BACKEND_PORT: String(basePort),
      },
    };
  }

  const libsDir = join(backendDir, "build", "libs");
  if (fileExists(libsDir)) {
    const jarCandidates = readdirSync(libsDir)
      .filter((entry) => entry.endsWith(".jar"))
      .sort();
    if (jarCandidates.length > 0) {
      return {
        command: "java",
        args: [
          "-jar",
          join(libsDir, jarCandidates[0]),
          `--server.port=${basePort}`,
        ],
        cwd: backendDir,
        env: {
          PORT: String(basePort),
          SERVER_PORT: String(basePort),
          BACKEND_PORT: String(basePort),
        },
      };
    }
  }

  throw new Error(
    `백엔드 실행기 탐색 실패: ${backendDir}에 gradlew/mvnw/gradle/maven/최신 build/libs jar가 없습니다.`
  );
}

async function resolveServices() {
  const usedPorts = new Set();
  const services = [];

  const webPort = await findAvailablePort(
    resolveInitialPort("web", 3000),
    usedPorts
  );
  usedPorts.add(webPort);
  const backendPort = await findAvailablePort(
    resolveInitialPort("backend", 8080),
    usedPorts
  );
  usedPorts.add(backendPort);
  const mobilePort = await findAvailablePort(
    resolveInitialPort("mobile", 8081),
    usedPorts
  );
  usedPorts.add(mobilePort);
  const racePort = await findAvailablePort(
    resolveInitialPort("race", 2567),
    usedPorts
  );
  usedPorts.add(racePort);

  const backendRunner = resolveBackendRunner(backendPort);
  const springBackendBaseUrl = `http://127.0.0.1:${backendPort}`;
  const springInternalToken =
    process.env.SPRING_INTERNAL_TOKEN?.trim() ||
    defaultLocalSpringInternalToken;
  const authSecret =
    resolveLocalEnvValue("AUTH_SECRET") || defaultLocalAuthSecret;
  const springProfilesActive =
    process.env.SPRING_PROFILES_ACTIVE?.trim() || defaultLocalSpringProfile;
  const databaseEnv = toDatabaseEnv(resolveLocalDatabaseUrl());
  const rootAuthProviderEnv = resolveRootAuthProviderEnv();

  services.push({
    name: "web",
    color: "\x1b[35m",
    command,
    args: ["--filter", "@yeon/web", "dev"],
    cwd: rootDir,
    env: {
      PORT: String(webPort),
      SPRING_BACKEND_BASE_URL: springBackendBaseUrl,
      SPRING_BOOTSTRAP_BASE_URL: springBackendBaseUrl,
      AUTH_SECRET: authSecret,
      SPRING_INTERNAL_TOKEN: springInternalToken,
      SPRING_PROFILES_ACTIVE: springProfilesActive,
      NEXT_PUBLIC_RACE_SERVER_URL: `ws://localhost:${racePort}`,
      ...rootAuthProviderEnv,
    },
    assignedPort: webPort,
    interactive: false,
  });

  services.push({
    name: "backend",
    color: "\x1b[33m",
    command: backendRunner.command,
    args: backendRunner.args,
    cwd: backendRunner.cwd,
    env: {
      ...backendRunner.env,
      AUTH_SECRET: authSecret,
      SPRING_INTERNAL_TOKEN: springInternalToken,
      SPRING_PROFILES_ACTIVE: springProfilesActive,
      ...databaseEnv,
      ...rootAuthProviderEnv,
    },
    assignedPort: backendPort,
    interactive: false,
  });

  services.push({
    name: "mobile",
    color: "\x1b[36m",
    command,
    args: [
      "--filter",
      "@yeon/mobile",
      "dev",
      "--",
      "--port",
      String(mobilePort),
    ],
    cwd: rootDir,
    env: {
      EXPO_DEV_SERVER_PORT: String(mobilePort),
      PORT: String(mobilePort),
    },
    assignedPort: mobilePort,
    interactive: false,
  });

  services.push({
    name: "race-server",
    color: "\x1b[32m",
    command,
    args: ["--filter", "@yeon/race-server", "dev"],
    cwd: rootDir,
    env: {
      PORT: String(racePort),
      SPRING_BACKEND_BASE_URL: springBackendBaseUrl,
      SPRING_BOOTSTRAP_BASE_URL: springBackendBaseUrl,
      SPRING_INTERNAL_TOKEN: springInternalToken,
      SPRING_PROFILES_ACTIVE: springProfilesActive,
    },
    assignedPort: racePort,
    interactive: false,
  });

  return services;
}

function logPortAssignments(services) {
  logLine({ name: "dev-all", color: "\x1b[33m" }, "최종 포트 할당:");
  for (const service of services) {
    logLine(
      { name: "dev-all", color: "\x1b[33m" },
      `- ${service.name}: ${service.assignedPort}`
    );
  }
}

function isInsideTmux() {
  if (!process.env.TMUX) {
    return false;
  }

  const result = runTmuxCommand(["display-message", "-p", "#{session_name}"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    return false;
  }

  return Boolean(result.stdout?.trim());
}

function maybeExit() {
  if (children.size > 0) {
    return;
  }
  process.exit(sawFailure ? 1 : 0);
}

function stopChildren(signal = "SIGINT") {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  for (const child of children.values()) {
    child.kill(signal);
  }

  setTimeout(() => {
    for (const child of children.values()) {
      child.kill("SIGKILL");
    }
  }, 2_000).unref();
}

function runLegacyMode(services) {
  for (const service of services) {
    const child = spawn(service.command, service.args, {
      cwd: service.cwd,
      env: {
        ...process.env,
        ...service.env,
      },
      stdio: service.interactive ? "inherit" : ["ignore", "pipe", "pipe"],
    });

    children.set(service.name, child);
    if (!service.interactive) {
      attachLines(service, child.stdout, "stdout");
      attachLines(service, child.stderr, "stderr");
    }

    child.on("exit", (code, signal) => {
      children.delete(service.name);

      if (shuttingDown) {
        maybeExit();
        return;
      }

      const exitReason = signal
        ? `signal ${signal}`
        : `code ${code === null ? "null" : code}`;
      if (code && code !== 0) {
        sawFailure = true;
        logLine(
          service,
          `프로세스가 ${exitReason}로 종료되었습니다.`,
          "stderr"
        );
      } else {
        logLine(service, `프로세스가 ${exitReason}로 종료되었습니다.`);
      }

      maybeExit();
    });

    child.on("error", (error) => {
      sawFailure = true;
      logLine(
        service,
        `프로세스를 시작하지 못했습니다: ${error.message}`,
        "stderr"
      );
    });
  }

  process.on("SIGINT", () => stopChildren("SIGINT"));
  process.on("SIGTERM", () => stopChildren("SIGTERM"));
}

function hasTmux() {
  const result = spawnSync("tmux", ["-V"], { stdio: "pipe", encoding: "utf8" });
  return result.status === 0;
}

function runTmuxCommand(args, options = {}) {
  return spawnSync("tmux", args, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    ...options,
  });
}

function buildTmuxCommand(service, logPath) {
  const envArgs = Object.entries(service.env || {})
    .map(([key, value]) => `${key}=${shellQuote(value)}`)
    .join(" ");
  const args = service.args.map((value) => shellQuote(value)).join(" ");
  const cwd = shellQuote(service.cwd || rootDir);
  const commandLine = `${shellQuote(service.command)} ${args}`.trim();
  const prefixedCommand =
    envArgs.length > 0 ? `${envArgs} ${commandLine}` : commandLine;

  return `cd ${cwd} && ${prefixedCommand} 2>&1 | tee -a ${shellQuote(logPath)}`;
}

function runTmuxMode(services) {
  if (!hasTmux()) {
    logLine(
      {
        name: "dev-all",
        color: "\x1b[33m",
      },
      "tmux가 없어 --legacy 모드로 실행합니다.",
      "stderr"
    );
    runLegacyMode(services);
    return;
  }

  const logDir = join(rootDir, ".tmp", "dev-all");
  const servicesWithLog = services.map((service) => ({
    ...service,
    logPath: join(logDir, `${service.name}.log`),
  }));

  mkdirSync(logDir, { recursive: true });
  for (const service of servicesWithLog) {
    writeFileSync(service.logPath, "");
  }

  const sessionName = `yeon-dev-all-${Date.now().toString(36)}`;
  const [firstService, ...restServices] = servicesWithLog;

  const firstResult = runTmuxCommand([
    "new-session",
    "-d",
    "-s",
    sessionName,
    "-n",
    firstService.name,
    buildTmuxCommand(firstService, firstService.logPath),
  ]);

  if (firstResult.status !== 0) {
    logLine(
      {
        name: "dev-all",
        color: "\x1b[31m",
      },
      `tmux 첫 창 생성 실패: ${firstResult.stderr || firstResult.error?.message}`,
      "stderr"
    );
    process.exit(1);
  }

  for (const service of restServices) {
    const windowResult = runTmuxCommand([
      "new-window",
      "-t",
      sessionName,
      "-n",
      service.name,
      buildTmuxCommand(service, service.logPath),
    ]);

    if (windowResult.status !== 0) {
      runTmuxCommand(["kill-session", "-t", sessionName]);
      logLine(
        {
          name: "dev-all",
          color: "\x1b[31m",
        },
        `tmux 창 생성 실패(${service.name}): ${windowResult.stderr || windowResult.error?.message}`,
        "stderr"
      );
      process.exit(1);
    }
  }

  for (const service of servicesWithLog) {
    const remainResult = runTmuxCommand([
      "set-window-option",
      "-t",
      `${sessionName}:${service.name}`,
      "remain-on-exit",
      "on",
    ]);

    if (remainResult.status !== 0) {
      logLine(
        {
          name: "dev-all",
          color: "\x1b[33m",
        },
        `remain-on-exit 설정 실패(${service.name})`,
        "stderr"
      );
    }
  }

  logLine(
    {
      name: "dev-all",
      color: "\x1b[33m",
    },
    `tmux 세션 시작: ${sessionName}`
  );
  logLine(
    {
      name: "dev-all",
      color: "\x1b[33m",
    },
    `로그: ${join(logDir, "<서비스명>.log")}`
  );
  const attached = isInsideTmux();
  logLine(
    {
      name: "dev-all",
      color: "\x1b[33m",
    },
    `tmux 창 이동: ${
      attached
        ? `tmux switch-client -t ${sessionName}`
        : `tmux a -t ${sessionName}`
    }`
  );

  const shouldAttach = process.stdout.isTTY && process.stdin.isTTY && !attached;

  if (shouldAttach) {
    const attach = spawn("tmux", ["attach-session", "-t", sessionName], {
      stdio: "inherit",
    });

    attach.on("exit", () => {
      process.exit(0);
    });
  } else {
    if (attached) {
      const switchResult = runTmuxCommand(["switch-client", "-t", sessionName]);

      if (switchResult.status === 0) {
        logLine(
          {
            name: "dev-all",
            color: "\x1b[33m",
          },
          "현재 tmux 세션에서 세션을 전환합니다."
        );
        process.exit(0);
      }

      logLine(
        {
          name: "dev-all",
          color: "\x1b[33m",
        },
        "현재 tmux 내부에서 세션 전환을 시도했지만 실패했습니다."
      );
      logLine(
        {
          name: "dev-all",
          color: "\x1b[33m",
        },
        `수동 전환: tmux switch-client -t ${sessionName} 또는 tmux a -d -t ${sessionName}`
      );
      process.exit(0);
    }

    logLine(
      {
        name: "dev-all",
        color: "\x1b[33m",
      },
      `이 환경은 TTY가 아니어서 자동 attach를 건너뜁니다. 세션으로 붙으려면: tmux a -t ${sessionName}`
    );
    process.exit(0);
  }
}

async function runDevAll() {
  const services = await resolveServices();
  ensureWebLockSafe();
  logPortAssignments(services);

  if (useLegacyMode) {
    runLegacyMode(services);
  } else {
    runTmuxMode(services);
  }
}

runDevAll().catch((error) => {
  logLine(
    {
      name: "dev-all",
      color: "\x1b[31m",
    },
    `실행 준비 중 오류: ${error.message}`,
    "stderr"
  );
  process.exit(1);
});
