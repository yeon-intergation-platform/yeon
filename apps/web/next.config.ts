import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";

const skipNextTypeCheckDuringDockerBuild =
  process.env.YEON_SKIP_NEXT_TYPECHECK_DURING_DOCKER_BUILD === "1";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  typescript: {
    // Docker image build runs after CI typecheck; skipping the duplicate Next check
    // prevents long silent self-hosted build steps from being canceled.
    ignoreBuildErrors: skipNextTypeCheckDuringDockerBuild,
  },
  transpilePackages: [
    "@yeon/api-contract",
    "@yeon/design-tokens",
    "@yeon/ui",
    "@yeon/race-shared",
    "@yeon/typing-race-engine",
    "nativewind",
    "react-native-css-interop",
    "@splinetool/react-spline",
    "@splinetool/runtime",
  ],
  serverExternalPackages: ["@aws-sdk/client-s3", "@aws-sdk/lib-storage"],
  turbopack: {
    resolveAlias: {
      "@colyseus/sdk": "./src/lib/colyseus-browser-shim.ts",
      "@tanstack/react-query": "./node_modules/@tanstack/react-query",
      react: "./node_modules/react",
      "react-dom": "./node_modules/react-dom",
      "react-native": "react-native-web",
    },
  },
  webpack(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@colyseus/sdk$": path.resolve(
        __dirname,
        "src/lib/colyseus-browser-shim.ts"
      ),
      "@tanstack/react-query$": path.resolve(
        __dirname,
        "node_modules/@tanstack/react-query"
      ),
      "@uiw/react-md-editor$": path.resolve(
        __dirname,
        "node_modules/@uiw/react-md-editor"
      ),
      react$: path.resolve(__dirname, "node_modules/react"),
      "react-dom$": path.resolve(__dirname, "node_modules/react-dom"),
      "react-native$": "react-native-web",
    };
    return config;
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry 소스맵 업로드 (프로덕션 빌드 시에만 동작)
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  webpack: {
    // 자동 instrumentation 비활성화 (instrumentation.ts에서 수동 설정)
    autoInstrumentServerFunctions: false,
  },
});
