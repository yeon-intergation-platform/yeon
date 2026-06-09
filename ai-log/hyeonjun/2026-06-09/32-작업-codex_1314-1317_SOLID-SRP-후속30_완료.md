# SOLID SRP 후속 30 — 모바일 카드 상세 row 렌더링 분리

## 목표

- 백로그 항목 184를 완료한다.
- `CardDeckDetailScreen`의 화면 상태 흐름과 카드 row 렌더링 책임을 분리한다.

## 변경

- `card-deck-detail-card-row.tsx`를 추가한다.
- 기존 `DeckCardRow` memo 컴포넌트와 `CardMarkdown` 기반 row 표시 책임을 새 파일로 이동한다.
- 상세 화면 파일에서는 row 컴포넌트를 import해 사용한다.
- 백로그에 30차 완료 섹션과 항목 184 완료 표시를 추가한다.

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
- 구조 증거 스크립트 — 통과 (`completed_count 167`, 다음 미완료 185)

## 결과

- 항목 184 완료.
- 모바일 카드 상세 화면은 화면 상태/mutation 흐름에 집중하고, 카드 row 표시/메뉴 이벤트는 `DeckCardRow`가 담당한다.
