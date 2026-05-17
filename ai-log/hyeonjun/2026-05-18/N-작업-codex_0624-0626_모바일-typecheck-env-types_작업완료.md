# 모바일 typecheck env/Node 타입 복구

## 목표

- CI의 `pnpm --filter @yeon/mobile typecheck` 실패 해결.

## 원인 후보

- `apps/mobile/src/types/expo-process-env.d.ts`가 `process`를 좁은 객체로 재선언해 `process.cwd()`와 새 Expo public env 키가 타입에 없다.
- 모바일 패키지에 Node 타입 의존성이 직접 없어 `node:fs`, `node:path` 타입 해석이 CI에서 실패한다.

## 계획

1. 모바일 env 타입을 `NodeJS.ProcessEnv` augmentation 형태로 정리.
2. 모바일 devDependency에 `@types/node` 명시.
3. `pnpm --filter @yeon/mobile typecheck`/lint 검증.

## 변경 결과

- 모바일 패키지 devDependency에 `@types/node`를 명시해 Node 기반 contract 테스트의 `node:fs`, `node:path`, `process.cwd()` 타입을 CI에서도 해석하게 했다.
- `expo-process-env.d.ts`를 `process` 재선언 대신 `NodeJS.ProcessEnv` augmentation으로 정리했다.
- `EXPO_PUBLIC_MOBILE_VARIANT`, `EXPO_PUBLIC_SKIP_ANONYMOUS_CHAT_PHONE_AUTH` env 키를 모바일 타입 SSOT에 추가했다.

## 검증

- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `git diff --check` 통과
