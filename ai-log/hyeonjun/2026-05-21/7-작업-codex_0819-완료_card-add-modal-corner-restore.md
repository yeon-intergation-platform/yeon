# 카드 추가 모달 모서리 복구

## 목표

- 카드 추가 직접 작성 editor shell의 비어 보이는 모서리를 복구한다.
- 변경 직후 main merge와 yeon pull까지 완료한다.

## 변경

- compact editor shell에 `overflow-hidden`을 복구해 toolbar/body가 rounded border 안에서 clipping되도록 했다.

## 검증

- `git diff --check` — 통과
- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
- `pnpm --filter @yeon/web build` — 통과
