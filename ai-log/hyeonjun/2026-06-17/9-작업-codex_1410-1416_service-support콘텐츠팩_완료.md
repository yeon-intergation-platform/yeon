# 9-작업-codex_1410-1416_service-support콘텐츠팩

## 범위

- 브랜치: `feat/service-support-content-pack-20260617`
- 목적: 유지보수 대상 3종 서비스(타자, 카드, 커뮤니티)의 공개 support 문서를 서비스별로 확장한다.
- 제외: 상담관리/상담 워크스페이스. 동결 정책에 따라 신규 도움말, FAQ, 뉴스, 문제 해결 문서 대상에서 제외한다.
- admin: 초기 범위는 읽기 전용 운영 현황판이다. 본문 수정/삭제 UI는 이번 차수에 넣지 않는다.

## 코드 근거

- 타자:
  - `apps/web/src/features/typing-service/use-typing-settings.ts`
  - `apps/web/src/features/typing-service/typing-service-fetch.ts`
  - `apps/web/src/features/typing-service/typing-race-solo-screen.tsx`
  - `apps/web/src/app/typing-service/practice/page.tsx`
- 카드:
  - `apps/web/src/features/card-service/use-card-service-decks-screen-state.ts`
  - `apps/web/src/features/card-service/components/merge-guest-dialog.tsx`
  - `apps/web/src/features/card-service/deck-play-screen.tsx`
  - `apps/web/src/features/card-service/utils/card-review-shortcuts.ts`
- 커뮤니티:
  - `apps/web/src/features/community/community-guest-identity.ts`
  - `apps/web/src/features/community/components/community-feed-forms.tsx`
  - `apps/web/src/features/community/chat-service-api.ts`
  - `apps/web/src/features/community/hooks/use-community-feed.ts`

## 변경 예정

- `apps/web/src/features/public-content/public-content-data.ts`에 support 글 6개 추가
- `apps/web/src/features/public-content/public-content-admin-model.test.ts`의 article count 갱신
- `docs/product/backlog/2026-06-17-service-support-content-pack.md` 추가

## 결과

- `support.yeon.world/typing` 문서 2개 추가
  - `typing/guides/change-practice-deck`
  - `typing/troubleshooting/race-room-connection-failed`
- `support.yeon.world/card` 문서 2개 추가
  - `card/guides/merge-guest-decks-after-login`
  - `card/guides/review-mode-shortcuts`
- `support.yeon.world/community` 문서 2개 추가
  - `community/guides/set-guest-nickname`
  - `community/troubleshooting/post-or-reply-failed`
- admin 공개 콘텐츠 통계 article count: 18 → 24
- 상담관리/상담 워크스페이스는 변경하지 않음

## 검증

- `pnpm --dir apps/web exec vitest run src/features/public-content/public-content-admin-model.test.ts src/lib/__tests__/seo.test.ts`
  - 2 files, 12 tests passed
- `pnpm --filter @yeon/web typecheck`
  - passed
- `pnpm --filter @yeon/web lint`
  - passed
- `pnpm --filter @yeon/web build`
  - passed
  - `/support/[...slug]` SSG: 기존 표시 3개 + 15개 추가 경로
- `git diff --check`
  - passed
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
  - passed
- `bash bin/verify-ssot.sh --project-only`
  - linked worktree에서는 `.git` 파일을 저장소로 보지 못해 프로젝트 검사를 건너뜀
- 루트 main 워크트리에서 `bash bin/verify-ssot.sh --project-only`
  - passed

## 참고

- `pnpm --filter @yeon/web test -- src/features/public-content/public-content-admin-model.test.ts src/lib/__tests__/seo.test.ts`는 `vitest run -- ...`로 실행되어 파일 필터가 적용되지 않고 전체 테스트를 돌렸다.
- 그 결과 이번 변경과 무관한 `features/cloud-import/hooks/use-import-draft-recovery.test.ts`가 Node localStorage 부재로 실패했다.
- 대상 테스트는 `pnpm --dir apps/web exec vitest run ...`으로 직접 실행해 통과시켰다.
