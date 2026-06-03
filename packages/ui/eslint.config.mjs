// packages/ui Universal UI 경계 강제 (idx=160).
// 포트/패턴 SSOT 본체가 플랫폼 의존(react-native/next/expo/@tanstack)을 직접 import하면
// 포트 순수성이 깨진다. 이 파일이 그 위반을 구조적으로 차단한다.
//
// 적용 범위: src/patterns/*.tsx, src/runtime/ports/**
// 제외 범위:
//   - src/primitives/** (플랫폼 어댑터가 의도적으로 react-native를 쓰는 경계 자체)
//   - src/patterns/**/*.native.tsx (패턴의 플랫폼별 어댑터 레이어 — 직접 import 허용)
import baseConfig from "../config/eslint/base.mjs";
import { universalUiBoundary } from "../config/eslint/universal-ui-boundary.mjs";

export default [
  ...baseConfig,

  // 포트/패턴 플랫폼-중립 SSOT: 플랫폼 직접 의존 금지.
  // *.native.tsx(어댑터 레이어)는 제외 — 플랫폼 import가 의도된 구현체.
  ...universalUiBoundary([
    "src/patterns/**/index.tsx",
    "src/runtime/ports/**/*.{ts,tsx}",
  ]),
];
