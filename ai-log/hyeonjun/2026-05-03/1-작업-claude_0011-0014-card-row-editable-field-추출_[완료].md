# card-row 편집 필드 컴포넌트 추출

## 목적

`apps/web/src/features/card-service/components/card-row.tsx`에서 질문/답변 편집 UI가 ~37줄씩 거의 동일 구조로 중복. `EditableField` 내부 컴포넌트로 추출.

## 범위

- `card-row.tsx` 단일 파일
- 동작 변경 없음 (순수 리팩토링)
- minRows만 차이 (질문 2, 답변 3)

## 검증

- typecheck: `pnpm --filter @yeon/web exec tsc --noEmit`
