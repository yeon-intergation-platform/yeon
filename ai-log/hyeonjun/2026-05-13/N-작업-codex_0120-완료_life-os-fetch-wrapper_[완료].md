# life-os fetch wrapper 분리 작업 로그

## 목표

- `features/life-os/life-os.tsx`의 직접 day 조회/저장 fetch 함수를 서비스 wrapper로 분리한다.
- 화면 컴포넌트가 HTTP 경로와 응답 파싱을 직접 소유하지 않도록 한다.

## 범위

- 대상: `apps/web/src/features/life-os/life-os.tsx`
- 신규: `apps/web/src/features/life-os/life-os-fetch.ts`
- 비범위: Life OS UI/도메인 계산/저장 API 동작 변경

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`

## 완료 내용

- `life-os-fetch.ts`를 추가해 Life OS day 조회/저장 HTTP 호출을 화면 파일 밖으로 분리했다.
- `life-os.tsx`는 React Query 조립, draft 상태, UI 렌더링만 담당하게 했다.
- query key helper는 기존 로컬 helper를 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과 (원본 worktree에서 실행)
- `rg "fetch\(" apps/web/src/features/life-os/life-os.tsx` 결과 0건
