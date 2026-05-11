# 타자연습 홈 뒤로가기 표시 안정화 작업 로그

## 목표

- `/typing-service` 브라우저 뒤로가기 복귀 시 프로필/오늘의 시작 패널이 숨지지 않게 한다.
- main 세로 패딩을 20px로 줄여 첫 뷰포트 내 정보를 더 잘 보이게 한다.

## 검증 계획

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`

## 완료 기록

- `loaded`가 false인 동안 전체 2열 패널을 숨기던 조건부 렌더링을 제거했다.
- localStorage 프로필 로딩 전에도 기본 프로필로 즉시 렌더링하고, 로딩 후 저장 프로필로 갱신되게 했다.
- main 세로 패딩을 `py-5 md:py-5`로 줄였다.
- 검증: `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`, `git diff --check`.
