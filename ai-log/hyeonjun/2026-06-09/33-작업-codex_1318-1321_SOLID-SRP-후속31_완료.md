# SOLID SRP 후속 31 — 모바일 카드 상세 조회 hook 분리

## 목표

- 백로그 항목 185를 완료한다.
- `CardDeckDetailScreen`의 데이터 조회 hook 책임을 전용 hook으로 분리한다.

## 변경

- `use-card-deck-detail-query.ts`를 추가한다.
- 상세 조회 `useQuery`, queryKey/enable 조건, 공용 view-state 파생, 오류 메시지 변환을 hook으로 이동한다.
- 화면은 hook이 반환한 `detail`, `detailState`, `cardCount`, `isReady`, `listItems`로 렌더링한다.
- 백로그에 31차 완료 섹션과 항목 185 완료 표시를 추가한다.

## 검증 예정

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 구조 증거 스크립트

## 검증 완료

- `CI=true pnpm --filter @yeon/mobile lint` — 통과
- `CI=true pnpm --filter @yeon/mobile typecheck` — 통과
- `CI=true pnpm verify:parity` — 통과
- `git diff --check` — 통과
- 구조 증거 스크립트 — 통과 (`completed_count 168`, 다음 미완료 186)

## 결과

- 항목 185 완료.
- 상세 조회 query/view-state 파생은 `useCardDeckDetailQuery`가 담당하고, 화면은 렌더링 결과값만 사용한다.
