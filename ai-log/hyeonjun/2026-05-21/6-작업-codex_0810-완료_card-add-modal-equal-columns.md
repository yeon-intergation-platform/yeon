# 카드 추가 모달 4분할 균등 폭 복구

## 목표

- 카드 추가 모달 직접 작성 화면의 4개 grid cell width를 동일하게 맞춘다.
- 오른쪽 카드 질문/답변 preview cell의 rounded border shell을 복구한다.

## 계획

- `add-card-form.tsx` desktop grid column을 1:1로 변경한다.
- `CardAddPreviewFace`/compact preview class가 독립 grid cell에서 자체 border/rounded를 갖도록 정리한다.
- web lint/typecheck로 검증한다.

## 변경

- 직접 작성 grid를 desktop 기준 2열 동일 비율(`lg:grid-cols-2`)로 바꿔 editor/preview cell 4개가 같은 폭을 나눠 갖게 했다.
- preview face 자체에 rounded border surface를 부여해 오른쪽 카드 질문/답변 cell도 모서리와 테두리를 갖게 했다.
- compact toolbar의 `이미지 삽입 가능` 상태 뱃지를 제거하고 toolbar grid의 빈 trailing column도 제거했다.

## 검증

- `grep -RIn "이미지 삽입 가능" apps/web/src/features/card-service/components` — 결과 없음
- `git diff --check` — 통과
- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
- `pnpm --filter @yeon/web build` — 통과
