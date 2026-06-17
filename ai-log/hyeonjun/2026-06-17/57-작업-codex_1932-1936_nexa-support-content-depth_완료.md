# NEXA support 초기 콘텐츠 보강

- 시작: 19:32
- 작업 워크트리: `yeon-2`
- 브랜치: `feat/nexa-support-content-depth-20260617`
- 목표: 공개 콘텐츠 500단계 13차 301~325를 구현한다.
- 범위: NEXA support provider/admin 글 추가, 권한/Message Content/Manage Webhooks 설명 보강, 관련 링크 보강.
- 검증 예정: public-content data/support/action/structured-data 관련 테스트, public-content audit, web typecheck/lint/build, SSOT 검사.
- 종료: 19:36

## 결과

- provider/admin 운영 support 글 4개를 추가했다.
- NEXA 권한 글에 permissions integer, Message Content Intent, Manage Webhooks fallback 설명을 보강했다.
- NEXA 설치/권한/문제 해결 글에 관련 support/news 링크를 추가했다.
- 공개 콘텐츠 500단계 계획의 301~325 항목을 완료로 표시했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-structured-data.test.ts src/features/public-content/public-content-support-action-summary.test.ts src/features/public-content/public-content-related-articles.test.ts` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
