# 공개 콘텐츠 admin 실데이터 대시보드 연결

## 목표

- `/admin/content`와 `/admin/content/[channel]`이 정적 registry가 아니라 Spring admin read API 데이터를 기준으로 현황을 보여주게 한다.
- admin 범위는 계속 읽기 전용으로 유지한다.

## 범위

- `apps/web/src/features/public-content/public-content-admin-model.ts`
- `apps/web/src/features/admin/admin-public-content-screen.tsx`
- `apps/web/src/app/admin/content/**`
- 관련 모델 테스트

## 진행 로그

- 15:47 작업 시작.
- 기존 admin 화면이 정적 registry 계산 함수에 직접 의존하는 구조를 확인했다.
- 15:51 Spring admin DTO 기반 dashboard builder와 admin page data loader 연결을 완료했다.

## 검증

- `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-admin-model.test.ts --reporter verbose`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
