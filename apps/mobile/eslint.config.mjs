import baseConfig from "../../packages/config/eslint/base.mjs";
import { universalUiBoundary } from "../../packages/config/eslint/universal-ui-boundary.mjs";

export default [
  ...baseConfig,

  // Universal UI 경계: 모바일에 존재하는 유지보수 서비스 feature는 플랫폼 의존 직접 import 금지(포트 경유).
  ...universalUiBoundary([
    "src/features/card-service/**/*.{ts,tsx}",
    "src/features/chat-service/**/*.{ts,tsx}",
    "src/features/life-os/**/*.{ts,tsx}",
  ]),
];
