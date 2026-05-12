# 카드 추가 모달 에디터/미리보기 레이아웃 개선

## 목표

- 카드 추가 모달 직접 작성 화면에서 툴바 2줄, 본문 입력 높이, 오른쪽 미리보기 크기/비율을 개선한다.

## 범위

- `apps/web/src/features/card-service/components/add-cards-panel.tsx`
- `apps/web/src/features/card-service/components/add-card-form.tsx`
- `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx`
- `apps/web/src/features/card-service/components/card-editor-toolbar.tsx`

## 진행

- 시작: 현황 확인 및 백로그 작성 완료.
- 구현: 모달 폭 확대, 에디터/미리보기 높이 variant(question/answer), 툴바 2줄 대응 간격/높이 조정 완료.
- 검증: `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`, `git diff --check` 통과.
- 참고: 워킹트리에 community 관련 타 작업 staged 변경이 있어 본 작업 커밋에서는 카드 서비스/백로그/작업로그 경로만 포함한다.
