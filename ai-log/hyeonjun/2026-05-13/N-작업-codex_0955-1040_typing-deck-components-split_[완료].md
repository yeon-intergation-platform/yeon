# 타자 덱 화면 컴포넌트 분리

## 목표

- `typing-decks-screen.tsx`의 덱 form/list/detail/passages 컴포넌트를 feature component 파일로 분리한다.
- 기존 외부 import 호환과 동작은 유지한다.

## 변경

- `typing-deck-components.tsx`를 추가해 덱 form/list/detail/passages 관련 컴포넌트와 label helper를 이동했다.
- `typing-decks-screen.tsx`는 화면 shell, scope tab 상태, 선택 deck 상태, 목록 query 연결만 담당하게 줄였다.
- 기존 `typing-decks-screen.tsx`에서 import하던 외부 호출부가 깨지지 않도록 re-export를 유지했다.
- 파일 이동 후 lint에서 잡힌 JSX 내부 `.isPending` 직접 접근을 submit/delete label 파생 변수로 정리했다.

## 검증

- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
