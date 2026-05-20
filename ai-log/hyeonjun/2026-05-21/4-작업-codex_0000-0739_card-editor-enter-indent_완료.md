# 카드 에디터 Enter 들여쓰기 유지

## 시작

- 워크트리: `/home/osuma/coding_stuffs/yeon`
- 브랜치: `codex/card-editor-enter-indent`
- 기준: `origin/main`

## 목표

- 일반 문단에서 사용자가 직접 입력한 선행 공백/탭 들여쓰기를 Enter 다음 줄에도 유지한다.
- 목록/코드블록/표 기본 동작은 건드리지 않는다.

## 변경

- `card-rich-markdown-editor.tsx`에서 일반 문단 Enter 입력 시 현재 줄의 선행 공백/탭을 다음 문단에 삽입한다.
- 목록 항목, 코드블록, 표 내부에서는 기존 TipTap 기본 Enter 동작을 유지한다.
- 선행 들여쓰기 계산을 `card-editor-enter-indent-utils.ts`로 분리하고 단위 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/card-service/components/card-editor-enter-indent-utils.test.ts` — 통과
- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
- `git diff --check` — 통과
