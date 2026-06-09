# SOLID SRP 후속 34

## 목표

- 백로그 항목 188을 완료한다.
- 모바일 `CardDeckListScreen` 큰 파일에서 렌더링 하위 컴포넌트, 에셋, 스타일 책임을 분리한다.

## 제약

- 카드 서비스 모바일 변경이므로 모바일 lint/typecheck와 parity 검증을 수행한다.
- 작업 후 main PR/merge까지 진행한다.

## 진행

- `DeckCard`를 `card-deck-list-deck-card.tsx`로 분리했다.
- 홈 화면 이미지 에셋 export를 `card-deck-list-assets.ts`로 분리했다.
- 화면 스타일 선언을 `card-deck-list-screen.styles.ts`로 분리했다.
- `CardDeckListScreen`은 세션/쿼리/생성 sheet 흐름과 화면 조립에 집중하도록 축소했다.
- 백로그 항목 188을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 구조 증거 스크립트: 300개 TODO 유지, 188번 완료 표시, 화면 파일 299라인으로 축소 및 하위 모듈 분리 확인

## 결과

- 백로그 항목 188 완료.
- 완료 수: 171/300. 다음 미완료 시작: 189.
