// Universal UI 경계 규칙 (SSOT) — drift를 구조적으로 차단하는 강제 장치.
//
// 유지보수 3종 서비스(card/typing/community + 공유 room/life-os)의 feature/screen 코드가
// 플랫폼 의존(next/expo router·storage·RN·데이터 SDK·웹 전용 UI 라이브러리)을 "직접" import하지
// 못하게 막는다. 모든 접근은 @yeon/ui 포트/런타임/프리미티브 경계를 거쳐야 한다.
//
// 이 규칙은 web/mobile 양쪽 eslint가 같은 파일을 spread 해서 쓰므로 경계 정의가 한곳(SSOT)에만 있다.
// 레지스트리: docs/architecture/universal-ui-parity-registry.yaml
// 설계 원장: docs/product/backlog/2026-06-03-universal-ui-screen-ports-ssot.md

const PORT = "@yeon/ui/runtime/ports";

const restrictedPaths = [
  {
    name: "react-native",
    message: `feature/screen은 react-native를 직접 import하지 말고 @yeon/ui/native 프리미티브를 사용하라.`,
  },
  {
    name: "react-native-web",
    message: `react-native-web 직접 import 금지. @yeon/ui 프리미티브를 사용하라.`,
  },
  {
    name: "@tanstack/react-query",
    message: `@yeon/ui/runtime/YeonQuery 를 사용하라(useYeonQuery/useYeonMutation/useYeonQueryClient).`,
  },
  {
    name: "@colyseus/sdk",
    message: `@yeon/ui/runtime/YeonRealtimeClient 를 사용하라.`,
  },
  {
    name: "zustand",
    message: `@yeon/ui/runtime/YeonStateStore 를 사용하라.`,
  },
  {
    name: "zustand/middleware",
    message: `@yeon/ui/runtime/YeonStateStore 를 사용하라.`,
  },
  {
    name: "framer-motion",
    message: `웹 전용 애니메이션 직접 의존 금지. @yeon/ui 패턴/프리미티브를 사용하라.`,
  },
  {
    name: "motion/react",
    message: `웹 전용 애니메이션 직접 의존 금지. @yeon/ui 패턴/프리미티브를 사용하라.`,
  },
  {
    name: "dompurify",
    message: `@yeon/ui rich-content(YeonMarkdown/YeonHtmlContent)을 사용하라.`,
  },
  {
    name: "react-markdown",
    message: `@yeon/ui rich-content(YeonMarkdown)을 사용하라.`,
  },
  {
    name: "remark-gfm",
    message: `@yeon/ui rich-content(YeonMarkdown)을 사용하라.`,
  },
  {
    name: "mermaid",
    message: `@yeon/ui rich-content(YeonMermaid)을 사용하라.`,
  },
  {
    name: "@uiw/react-md-editor",
    message: `@yeon/ui 마크다운 에디터 wrapper를 사용하라.`,
  },
  {
    name: "lucide-react",
    message: `@yeon/ui 의 YeonIcon 을 사용하라.`,
  },
  {
    name: "lucide-react-native",
    message: `@yeon/ui 의 YeonIcon 을 사용하라.`,
  },
  {
    name: "expo-router",
    message: `@yeon/ui/native 와 ${PORT} 네비게이션 포트를 사용하라(경로 하드코딩 금지).`,
  },
  {
    name: "expo-secure-store",
    message: `@yeon/ui/runtime/YeonSecureStorage 또는 ${PORT} KeyValueStore 포트를 사용하라.`,
  },
  {
    name: "@react-native-async-storage/async-storage",
    message: `@yeon/ui/runtime 저장소 또는 ${PORT} KeyValueStore 포트를 사용하라.`,
  },
];

const restrictedPatterns = [
  {
    group: ["next/*"],
    message: `feature/screen은 next/* 를 직접 import하지 말고 @yeon/ui 경계(YeonLink/YeonImage/YeonNavigation/${PORT})를 사용하라.`,
  },
  {
    group: ["@tiptap/*"],
    message: `@yeon/ui rich-content(YeonTiptap)을 사용하라.`,
  },
  {
    group: ["@radix-ui/*"],
    message: `@yeon/ui 프리미티브를 사용하라.`,
  },
];

// featureGlobs: 이 앱에서 경계를 강제할 유지보수 서비스 feature 글롭들(상담/동결 제외).
export function universalUiBoundary(featureGlobs) {
  return [
    {
      files: featureGlobs,
      rules: {
        "no-restricted-imports": [
          "error",
          { paths: restrictedPaths, patterns: restrictedPatterns },
        ],
      },
    },
  ];
}
