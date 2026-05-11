import { createServer } from "node:net";

export const PORT_MIN = 1;
export const PORT_MAX = 65_535;

export function normalizePort(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);

  if (!Number.isInteger(parsed) || parsed < PORT_MIN || parsed > PORT_MAX) {
    return fallback;
  }

  return parsed;
}

export function isValidPort(value) {
  return Number.isInteger(value) && value >= PORT_MIN && value <= PORT_MAX;
}

export async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.on("error", (error) => {
      if (
        error.code === "EADDRINUSE" ||
        error.code === "EACCES" ||
        error.code === "EADDRNOTAVAIL"
      ) {
        resolve(false);
        return;
      }

      resolve(false);
    });

    server.listen({ port, host: "127.0.0.1" }, () => {
      server.close(() => {
        resolve(true);
      });
    });
  });
}

export async function findAvailablePort(startPort, reservedPorts = new Set()) {
  let candidate = startPort;

  if (!isValidPort(candidate)) {
    throw new Error(`잘못된 시작 포트입니다: ${startPort}`);
  }

  while (candidate <= PORT_MAX) {
    if (!reservedPorts.has(candidate) && (await isPortAvailable(candidate))) {
      return candidate;
    }

    candidate += 1;
  }

  throw new Error(
    `포트 탐색 실패: ${startPort}~${PORT_MAX} 모두 사용 중입니다.`
  );
}
