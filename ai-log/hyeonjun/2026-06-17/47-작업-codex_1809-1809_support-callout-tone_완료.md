# 작업 로그: support callout 상태 표현

## 목표

`docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`의 192번, 193번을 진행한다. support 문서의 주의 박스는 빨간색 남용 없이 구분하고, 성공/완료 박스는 조용한 녹색 계열로 제한한다.

## 범위

- 공개 콘텐츠 callout 데이터 타입
- 공개 콘텐츠 callout 렌더링 스타일
- 공개 콘텐츠 품질 audit
- 단위 테스트

## 제외

- CMS 편집 기능
- 관리자 수정/삭제 기능
- 상담 워크스페이스 콘텐츠

## 변경

- `PublicContentBlock` callout에 `tone` 필드를 추가한다.
- `note`, `warning`, `success` tone별 스타일 매핑을 추가한다.
- 주의성 support callout에 warning tone을 지정한다.
- 설치 완료 상태를 나타내는 success callout을 추가한다.
- audit에서 callout tone 허용값을 검증한다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-block-view.test.ts` 통과: 6 tests
- `pnpm --filter @yeon/web public-content:audit` 통과: 36개 공개 콘텐츠 글 검사
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과: 213 static pages
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
- Playwright `/support/nexa/guides/add-nexa-discord-bot` desktop/mobile 확인
  - desktop: overflow 없음, warning `rgb(255, 250, 240)` / success `rgb(243, 250, 245)`
  - mobile 390px: overflow 없음, warning/success width 342px
