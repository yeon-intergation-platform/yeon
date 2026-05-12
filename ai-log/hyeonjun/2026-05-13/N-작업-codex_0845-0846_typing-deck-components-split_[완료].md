# 타자 덱 관리 컴포넌트 역할 분리

## 목표

- `typing-deck-components.tsx` God component 집합을 역할별 파일로 분리한다.
- 기존 `typing-decks-screen.tsx` import/re-export seam은 유지한다.

## 계획

1. label/meta, deck form/list, passage editor/list, bulk import, detail panel 파일을 추가한다.
2. `typing-deck-components.tsx`는 re-export bridge로 축소한다.
3. web typecheck/lint/build 및 docs/rules 검증을 수행한다.

## 진행

- 작업 시작.

## 완료

- `typing-deck-meta.ts` 추가: scope tab과 덱 label/badge helper 분리.
- `typing-deck-form.tsx` 추가: 덱 생성/수정 form 분리.
- `typing-deck-list.tsx` 추가: 덱 목록 view 분리.
- `typing-deck-passage-editor.tsx` 추가: 문단 직접 추가/수정 form 분리.
- `typing-deck-bulk-passage-import-form.tsx` 추가: AI 붙여넣기 bulk import form 분리.
- `typing-deck-passage-list.tsx` 추가: 문단 목록/삭제 view 분리.
- `typing-deck-detail-panel.tsx` 추가: 상세 panel orchestration 분리.
- `typing-deck-components.tsx`는 기존 호출부를 위한 re-export bridge로 축소.

## 검증

- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `git diff --check` 성공.
- `bash bin/sync-skills.sh --check` 성공.
- `bash bin/verify-ssot.sh --project-only` 성공.
