# Yeon 서비스 support 초기 콘텐츠

- 시작: 19:38
- 작업 워크트리: `yeon-3`
- 브랜치: `feat/yeon-services-support-content-20260617`
- 목표: 공개 콘텐츠 500단계 14차 326~350을 구현한다.
- 범위: typing/card/community/account support 글 추가, race-server/guest-login/community-policy 설명 보강, mooddesk 제외 정책 고정.
- 검증 예정: public-content data/support/action/structured-data 관련 테스트, public-content audit, web typecheck/lint/build, SSOT 검사.
- 종료: 19:45

## 결과

- typing, card, community, account support 글 16개를 추가했다.
- 기존 support 글에 race-server, 게스트/로그인 저장 차이, 공개 피드 행동 기준, YEON 전체 개인정보 기준을 보강했다.
- mooddesk는 공개 support 글을 만들지 않는 정책을 테스트로 고정했다.
- 공개 콘텐츠 500단계 계획의 326~350 항목을 완료로 표시했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-data.test.ts src/features/public-content/public-content-structured-data.test.ts src/features/public-content/public-content-support-action-summary.test.ts src/features/public-content/public-content-related-articles.test.ts` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
