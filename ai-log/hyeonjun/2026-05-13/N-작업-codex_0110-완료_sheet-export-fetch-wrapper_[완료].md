# sheet-export fetch wrapper 분리 작업 로그

## 목표

- `features/student-management/components/sheet-export-panel.tsx`의 직접 fetch 호출을 서비스별 wrapper로 분리한다.
- HTTP 경로, 에러 파싱, 응답 타입을 한 파일에 모아 프론트 구조 표준화 목표의 direct fetch 축소를 진행한다.

## 범위

- 대상: `apps/web/src/features/student-management/components/sheet-export-panel.tsx`
- 신규: `apps/web/src/features/student-management/hooks/sheet-export-fetch.ts`
- 비범위: Spring/API 동작 변경, UI 디자인 변경, 시트 동기화 정책 변경

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`

## 완료 내용

- `sheet-export-fetch.ts`를 추가해 Google 연결 상태, sheet-export 상태/연결/동기화/가져오기/다운로드/연결해제 HTTP 호출을 모았다.
- `sheet-export-panel.tsx`에서 직접 `fetch()` 호출을 제거하고 UI 상태 조립만 남겼다.
- 다운로드는 wrapper가 Blob 획득까지만 담당하고 DOM anchor 클릭은 컴포넌트가 담당하도록 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과 (원본 worktree에서 실행)
- `rg "fetch\(" apps/web/src/features/student-management/components/sheet-export-panel.tsx` 결과 0건
