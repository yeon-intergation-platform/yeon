# 카드 에디터 빈 목록 항목 Backspace 동작 보정

## 목표

- 빈 목록 항목에서 Backspace 시 이전 항목에 병합하지 않고 목록 밖 빈 일반 문단으로 전환한다.

## 기준

- 작업 워크트리: `/home/osuma/coding_stuffs/yeon-3`
- 브랜치: `codex/card-editor-list-backspace`
- 기준: `origin/main`

## 변경

- 빈 목록 항목의 시작점에서 Backspace를 누르면 기본 병합 동작을 막고 `liftListItem("listItem")`으로 목록 밖 일반 문단으로 전환한다.
- 일반 텍스트가 있거나 범위 선택이 있거나 조합키가 있는 Backspace는 기존 동작을 유지한다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- jsdom 기반 임시 TipTap 재현으로 빈 목록 항목 lift 명령이 `<ul><li>...</li></ul><p></p>` 구조를 만드는 것 확인
- `git diff --check` 통과
