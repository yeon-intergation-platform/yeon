# 카드 추가 모달 표 편집 버튼 크기 통일

## 목표

- 카드 추가 모달 내부 표 편집 버튼들을 현재 `표 삽입` 툴바 버튼과 같은 정사각형 크기로 맞춘다.

## 확인

- 작업 워크트리: `/home/osuma/coding_stuffs/yeon-2`
- 브랜치: `codex/card-add-modal-button-size` (`origin/main` 기준)
- 대상 파일 후보:
  - `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx`
  - `apps/web/src/features/card-service/components/card-rich-markdown-editor-view.tsx`

## 진행

- 백로그 작성 완료.

## 변경

- 표 편집 액션(행 추가/열 추가/표 정렬)을 `표 삽입` 툴바 버튼과 같은 `h-8 w-8 rounded-lg` 아이콘 버튼으로 통일.
- 버튼 의미는 `aria-label`과 `title`로 유지.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
