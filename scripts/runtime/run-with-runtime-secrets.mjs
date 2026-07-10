import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hydrateRuntimeSecrets } from "./runtime-secret-loader.mjs";

const entrypoint = process.env.YEON_RUNTIME_ENTRYPOINT?.trim();
if (!entrypoint) {
  throw new Error("YEON_RUNTIME_ENTRYPOINT가 비어 있습니다.");
}

hydrateRuntimeSecrets();
delete process.env.YEON_REQUIRED_SECRETS;
delete process.env.YEON_OPTIONAL_SECRETS;
delete process.env.YEON_RUNTIME_ENTRYPOINT;

await import(pathToFileURL(resolve(entrypoint)).href);
