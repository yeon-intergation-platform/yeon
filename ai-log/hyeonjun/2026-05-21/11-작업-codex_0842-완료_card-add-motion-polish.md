# 카드 추가 모달 버튼 모션 개선

## 목표

- 직접 작성/일괄 추가 버튼과 markdown toolbar 버튼에 framer-motion 기반의 작은 hover/tap 모션을 적용한다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 변경

- 직접 작성/일괄 추가 mode tab을 `motion.button`으로 바꾸고 작은 hover/tap spring motion을 적용했다.
- markdown toolbar icon button을 `motion.button`으로 바꾸고 disabled 상태를 제외한 hover/tap motion을 적용했다.
- 기존 색상/크기/layout은 유지했다.

## 검증

- `git diff --check` — 통과
- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
- `pnpm --filter @yeon/web build` — 통과
