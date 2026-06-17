# 25차 작업 로그 - 공개 콘텐츠 품질 Audit 스크립트

시작: 2026-06-17 16:06 KST  
종료: 2026-06-17 16:07 KST  
담당: Codex  
브랜치: `feat/public-content-quality-audit-20260617`

## 목표

- 정적 공개 콘텐츠 registry를 검사하는 로컬 audit 스크립트를 추가한다.
- source path, slug, 제목/설명, 본문 block 품질을 자동으로 확인한다.
- 상담 워크스페이스는 audit 대상 콘텐츠로 만들지 않는다.

## 결과

- `apps/web/scripts/audit-public-content-quality.ts`를 추가했다.
- `pnpm --filter @yeon/web public-content:audit` 명령을 추가했다.
- 현재 정적 공개 콘텐츠 33개가 audit 기준을 통과함을 확인했다.

## 검증

- 통과: `pnpm --filter @yeon/web public-content:audit`
- 통과: `pnpm --filter @yeon/web lint`
- 통과: `pnpm --filter @yeon/web typecheck`
- 통과: `git diff --check`
- 통과: `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- 통과: `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
