# 모바일 typecheck 환경변수/Node 테스트 타입 복구 (2026-05-18)

## 1차

### 작업내용

- `@yeon/mobile` CI typecheck에서 테스트 파일의 `node:fs`, `node:path`, `process.cwd()`와 Expo public env 타입이 누락되어 실패하는 문제를 복구한다.
- Expo public env 키는 모바일 전역 타입의 SSOT에 선언하고, Node 기반 contract 테스트가 타입 검사에서 깨지지 않도록 Node 타입 의존성을 명시한다.

### 논의 필요

- 없음. CI에서 `pnpm --filter @yeon/mobile typecheck`가 실패하고 있어 즉시 복구가 필요하다.

### 선택지

1. 실패 테스트를 tsconfig exclude로 뺀다.
2. 테스트 파일마다 `declare`를 흩뿌린다.
3. 모바일 env 타입 선언을 정리하고 Node 타입 의존성을 명시한다.

### 추천

- 3번. 테스트를 숨기지 않고, Expo env 타입과 Node 테스트 타입의 source of truth를 명확히 한다.

### 사용자 방향

- 추천 기준으로 진행한다.
