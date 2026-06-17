# blog 카드와 상세 품질 정책

- 시작: 19:01
- 작업 워크트리: `yeon-2`
- 브랜치: `feat/blog-detail-quality-20260617`
- 목표: 공개 콘텐츠 500단계 10차 233~250을 구현한다.
- 범위: blog 카드 메타 표시, 상세 운영 주체, 관련 support/news 링크, repo 근거 링크, 목차/타이포그래피 정책.
- 검증 예정: blog detail/card 정책 테스트, public-content audit, web typecheck/lint/build, Playwright blog 상세 확인.

## 결과

- blog 카드 메타 helper를 추가해 분류, 날짜, 읽는 시간 표시를 테스트로 고정했다.
- blog 상세 context panel을 추가해 운영 주체, 관련 support, 관련 공식 소식, engineering repo 근거를 렌더링했다.
- blog 목차 정책을 긴 engineering 글에만 기본 노출하도록 제한했다.
- blog 상세 본문 폭과 spacing을 조정하고 500단계 계획 233~250을 완료 표시했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-article-card.test.ts src/features/public-content/public-content-blog-detail.test.ts src/features/public-content/public-content-table-of-contents.test.ts src/features/public-content/public-content-title-quality.test.ts src/features/public-content/public-content-blog-home.test.ts`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
- Playwright `/blog/engineering/nexa-provider-pool-overview`, `/blog/essay/why-support-docs-first` desktop/mobile: 200, 필수 문구 누락 없음, 금지 문구 없음, 가로 overflow 없음

## 완료

- 종료: 19:06
