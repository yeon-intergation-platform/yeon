const path = require("node:path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.blockList = [
  ...(config.resolver.blockList ?? []),
  /.*\/apps\/web\/\.next\/.*/,
  /.*\/apps\/web\/\.data\/.*/,
];

// colyseus(@colyseus/sdk) 실시간 클라이언트가 React Native 전역 WebSocket을 쓰도록
// Node 'ws'(stream 의존) 모듈을 shim으로 대체한다(카드방 실시간 연결).
const wsShimPath = path.resolve(projectRoot, "ws-shim.js");
const previousResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "ws") {
    return { type: "sourceFile", filePath: wsShimPath };
  }
  if (previousResolveRequest) {
    return previousResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  projectRoot,
});
