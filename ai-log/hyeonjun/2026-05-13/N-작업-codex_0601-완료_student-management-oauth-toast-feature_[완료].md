# student-management OAuth toast feature component 이동

## 목표

- student-management route layout 내부의 OAuth 결과 토스트 구현을 feature component로 이동한다.
- layout 파일이 route/provider/sidebar 조립에 집중하도록 줄인다.

## 변경 대상

- `apps/web/src/app/counseling-service/student-management/layout.tsx`
- `apps/web/src/features/student-management/components/oauth-result-toast.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료

- OAuth 결과 토스트 구현을 `features/student-management/components/oauth-result-toast.tsx`로 이동했다.
- `student-management/layout.tsx`는 feature component를 렌더링만 하도록 정리했다.
- layout 파일 크기를 480줄에서 389줄로 줄였다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
