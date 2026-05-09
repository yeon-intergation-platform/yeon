import fs from "node:fs";
import net from "node:net";
import { spawnSync } from "node:child_process";
import path from "node:path";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const gradleCommand =
  process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const tmuxCommand = process.platform === "win32" ? "tmux.exe" : "tmux";
const shell = process.env.SHELL ?? "zsh";
const projectRoot = process.cwd();

function fail(message) {
  console.error(`[dev:all] ${message}`);
  process.exit(1);
}

function quoteShell(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function runTmux(args, options = {}) {
  const result = spawnSync(tmuxCommand, args, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: options.captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    fail(`tmux 실행 실패: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    fail(
      [stderr, stdout].find(Boolean) ??
        `tmux 명령이 code ${result.status}로 종료되었습니다.`
    );
  }

  return result.stdout?.trim() ?? "";
}

function getNodeModulesWarningLines() {
  const nodeModulesPath = path.join(projectRoot, "node_modules");

  if (fs.existsSync(nodeModulesPath)) {
    return [];
  }

  return [
    'echo "[dev:all] node_modules가 없어 일부 JS 서비스가 즉시 종료될 수 있습니다."',
    'echo "[dev:all] 먼저 pnpm install 을 실행하세요."',
    'echo ""',
  ];
}

function ensureDir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function buildPaneCommand(service) {
  const serviceCommand = [service.command, ...(service.args ?? [])]
    .map(quoteShell)
    .join(" ");
  const escapedName = service.name.replace(/"/g, '\\"');
  const exports = Object.entries(service.env ?? {}).map(
    ([key, value]) => `export ${key}=${quoteShell(value)}`
  );
  const portLine = service.port
    ? `echo \"[${escapedName}] port ${service.port}\"`
    : null;
  const warningLines = service.showDependencyWarning
    ? getNodeModulesWarningLines()
    : [];
  const logIntroLine = service.logFile
    ? `echo \"[${escapedName}] log ${service.logFile}\"`
    : null;
  const logHeaderLines = service.logFile
    ? [
        `mkdir -p ${quoteShell(service.logDir)}`,
        `printf '%s\\n' \"=== ${escapedName} | $(date '+%Y-%m-%d %H:%M:%S %Z') ===\" >> ${quoteShell(service.logFile)}`,
      ]
    : [];
  const executedCommand = service.logFile
    ? `${serviceCommand} > >(tee -a ${quoteShell(service.logFile)}) 2> >(tee -a ${quoteShell(service.logFile)} >&2)`
    : serviceCommand;

  return `${shell} -lc ${quoteShell(
    [
      `cd ${quoteShell(service.cwd)}`,
      "clear",
      `echo \"=== ${escapedName} ===\"`,
      ...(portLine ? [portLine] : []),
      ...(logIntroLine ? [logIntroLine] : []),
      ...warningLines,
      ...logHeaderLines,
      ...exports,
      executedCommand,
      "exit_code=$?",
      'echo ""',
      `echo \"[${escapedName}] exited with code $exit_code\"`,
      'echo "[dev:all] pane는 유지됩니다. 위 로그와 log 경로를 확인하세요."',
      `exec ${quoteShell(shell)} -i`,
    ].join("; ")
  )}`;
}

function sendServiceToPane(paneId, service) {
  runTmux(["select-pane", "-t", paneId, "-T", service.name]);
  runTmux(["set-window-option", "-t", paneId, "remain-on-exit", "on"]);
  runTmux(["send-keys", "-t", paneId, buildPaneCommand(service), "C-m"]);
}

function createMainWindow(sessionName, services) {
  const targetSession = `${sessionName}:`;
  const firstPaneId = runTmux(
    [
      "new-window",
      "-P",
      "-F",
      "#{pane_id}",
      "-t",
      targetSession,
      "-n",
      "dev-all",
    ],
    { captureOutput: true }
  );

  const secondPaneId = runTmux(
    ["split-window", "-h", "-P", "-F", "#{pane_id}", "-t", firstPaneId],
    { captureOutput: true }
  );

  const thirdPaneId = runTmux(
    ["split-window", "-h", "-P", "-F", "#{pane_id}", "-t", firstPaneId],
    { captureOutput: true }
  );

  runTmux(["select-layout", "-t", firstPaneId, "even-horizontal"]);

  [firstPaneId, secondPaneId, thirdPaneId].forEach((paneId, index) => {
    sendServiceToPane(paneId, services[index]);
  });
}

function createExtraWindows(sessionName, services) {
  services.forEach((service) => {
    const paneId = runTmux(
      [
        "new-window",
        "-P",
        "-F",
        "#{pane_id}",
        "-t",
        `${sessionName}:`,
        "-n",
        service.name,
      ],
      { captureOutput: true }
    );

    sendServiceToPane(paneId, service);
  });
}

function createDetachedSession() {
  const sessionName = `yeon-dev-all-${Date.now()}`;
  runTmux(["new-session", "-d", "-s", sessionName, "-n", "bootstrap"]);
  return sessionName;
}

function createLogRoot(sessionName) {
  const logRoot = path.join(projectRoot, ".logs", "dev-all", sessionName);
  ensureDir(logRoot);
  return logRoot;
}

function cleanupManagedWindows(sessionName) {
  const windows = runTmux(
    ["list-windows", "-t", `${sessionName}:`, "-F", "#{window_name}"],
    { captureOutput: true }
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  ["dev-all", "race-server"].forEach((windowName) => {
    if (windows.includes(windowName)) {
      runTmux(["kill-window", "-t", `${sessionName}:${windowName}`]);
    }
  });
}

function cleanupBootstrapWindow(sessionName) {
  const windows = runTmux(
    ["list-windows", "-t", `${sessionName}:`, "-F", "#{window_name}"],
    { captureOutput: true }
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (windows.length <= 1 || !windows.includes("bootstrap")) {
    return;
  }

  runTmux(["kill-window", "-t", `${sessionName}:bootstrap`]);
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(startPort, reservedPorts = new Set()) {
  let port = startPort;

  while (reservedPorts.has(port) || !(await canListen(port))) {
    port += 1;
  }

  return port;
}

async function resolvePorts() {
  const reservedPorts = new Set();
  const racePort = await findAvailablePort(2567, reservedPorts);
  reservedPorts.add(racePort);
  const backendPort = await findAvailablePort(8081, reservedPorts);
  reservedPorts.add(backendPort);
  const webPort = await findAvailablePort(3000, reservedPorts);
  reservedPorts.add(webPort);
  const mobilePort = await findAvailablePort(8081, reservedPorts);
  reservedPorts.add(mobilePort);

  return { racePort, backendPort, webPort, mobilePort };
}

function createServices(ports, logRoot) {
  const backendBaseUrl = `http://127.0.0.1:${ports.backendPort}`;
  const webBaseUrl = `http://localhost:${ports.webPort}`;
  const raceServerUrl = `ws://localhost:${ports.racePort}`;
  const withLogFile = (serviceName) => ({
    logDir: logRoot,
    logFile: path.join(logRoot, `${serviceName}.log`),
  });

  return {
    mainPaneServices: [
      {
        name: "web",
        cwd: projectRoot,
        command,
        args: ["--filter", "@yeon/web", "dev"],
        env: {
          PORT: String(ports.webPort),
          SPRING_BOOTSTRAP_BASE_URL: backendBaseUrl,
          SPRING_BACKEND_BASE_URL: backendBaseUrl,
          NEXT_PUBLIC_RACE_SERVER_URL: raceServerUrl,
        },
        port: ports.webPort,
        showDependencyWarning: true,
        ...withLogFile("web"),
      },
      {
        name: "backend",
        cwd: path.join(projectRoot, "apps/backend"),
        command: gradleCommand,
        args: ["bootRun", `--args=--server.port=${ports.backendPort}`],
        port: ports.backendPort,
        ...withLogFile("backend"),
      },
      {
        name: "mobile",
        cwd: projectRoot,
        command,
        args: [
          "--filter",
          "@yeon/mobile",
          "dev",
          "--",
          "--port",
          String(ports.mobilePort),
        ],
        env: {
          EXPO_PUBLIC_API_BASE_URL: webBaseUrl,
        },
        port: ports.mobilePort,
        showDependencyWarning: true,
        ...withLogFile("mobile"),
      },
    ],
    extraWindowServices: [
      {
        name: "race-server",
        cwd: projectRoot,
        command,
        args: ["--filter", "@yeon/race-server", "dev"],
        env: {
          PORT: String(ports.racePort),
        },
        port: ports.racePort,
        showDependencyWarning: true,
        ...withLogFile("race-server"),
      },
    ],
  };
}

async function main() {
  const tmuxCheck = spawnSync(tmuxCommand, ["-V"], {
    cwd: projectRoot,
    stdio: "ignore",
  });

  if (tmuxCheck.error || tmuxCheck.status !== 0) {
    fail("tmux가 필요합니다. tmux 설치 후 다시 실행해주세요.");
  }

  const sessionName = process.env.TMUX
    ? runTmux(["display-message", "-p", "#{session_name}"], {
        captureOutput: true,
      })
    : createDetachedSession();

  cleanupManagedWindows(sessionName);

  const ports = await resolvePorts();
  const logRoot = createLogRoot(sessionName);
  const { mainPaneServices, extraWindowServices } = createServices(
    ports,
    logRoot
  );

  createMainWindow(sessionName, mainPaneServices);
  createExtraWindows(sessionName, extraWindowServices);
  cleanupBootstrapWindow(sessionName);
  runTmux(["select-window", "-t", `${sessionName}:dev-all`]);
  runTmux([
    "display-message",
    "-d",
    "7000",
    `race-server window 생성됨: ${sessionName}:race-server | web ${ports.webPort} | mobile ${ports.mobilePort} | backend ${ports.backendPort} | race ${ports.racePort} | logs ${logRoot}`,
  ]);

  if (!process.env.TMUX) {
    runTmux(["attach-session", "-t", sessionName]);
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
