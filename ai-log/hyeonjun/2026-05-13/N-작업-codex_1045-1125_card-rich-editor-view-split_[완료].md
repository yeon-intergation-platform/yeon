# 카드 리치 에디터 view 분리

## 목표

- 카드 리치 마크다운 에디터에서 preview/global style view 책임을 분리한다.
- 에디터 본체는 TipTap wiring과 업로드/toolbar orchestration에 집중시킨다.

## 변경

- `card-rich-markdown-editor-view.tsx`를 추가했다.
- 미리보기 렌더링, 의미 있는 콘텐츠 판정, 에디터 global style을 view 파일로 이동했다.
- `card-rich-markdown-editor.tsx`는 TipTap 설정, 업로드 이벤트, toolbar 연결, 모바일 pane 상태만 담당하게 줄였다.
- UI/동작/업로드 흐름은 변경하지 않았다.

## 검증

- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅
