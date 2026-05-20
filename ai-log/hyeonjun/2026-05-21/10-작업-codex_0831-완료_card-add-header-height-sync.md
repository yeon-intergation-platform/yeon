# 카드 추가 모달 4개 헤더 높이 통일

## 목표

- 카드 질문/질문 미리보기/카드 답변/답변 미리보기 4개 header 높이를 같은 기준으로 맞춘다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 변경

- compact editor toolbar header의 min-height를 `min-h-12`로 조정했다.
- preview face header에도 같은 `min-h-12`를 적용해 4개 cell header 높이 기준을 통일했다.

## 검증

- `git diff --check` — 통과
- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
- `pnpm --filter @yeon/web build` — 통과
