# 카드 추가 모달 행 높이 동기화 대상 분리

## 목표

- 질문 row와 답변 row의 height 동기화 대상을 분리한다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 변경

- 직접 작성 desktop grid row를 `minmax(min-content,1fr)` 2행에서 `auto_auto`로 바꿨다.
- 질문 row와 답변 row가 서로 다른 행 콘텐츠 높이에 의해 함께 늘어나지 않게 했다.

## 검증

- `git diff --check` — 통과
- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
- `pnpm --filter @yeon/web build` — 통과
