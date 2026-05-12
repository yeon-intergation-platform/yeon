# public check route bridge 분리

## 목표

- `app/check/[token]/page.tsx`를 route bridge로 축소한다.
- public check 화면 상태/검증/제출 orchestration은 feature component로 이동한다.

## 계획

1. 기존 page의 helper/state/mutation/render 책임을 feature component로 이동한다.
2. app page는 params/search 해석과 feature component 렌더링만 남긴다.
3. web typecheck/lint/build 및 SSOT 검증을 실행한다.

## 완료

- public check 화면 상태/검증/제출 orchestration을 `PublicCheckPageContent` feature component로 이동했다.
- `app/check/[token]/page.tsx`는 token params와 entry search param을 해석해 feature component에 전달하는 route bridge로 축소했다.
- page 파일을 305줄에서 26줄로 줄였다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
