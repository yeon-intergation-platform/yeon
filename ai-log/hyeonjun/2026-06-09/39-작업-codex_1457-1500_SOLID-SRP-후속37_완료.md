# SOLID SRP 후속 37

## 목표

- 백로그 항목 191을 완료한다.
- 모바일 `CardDeckListScreen`의 긴 렌더링/조건 분기 책임을 섹션 컴포넌트로 분리한다.

## 제약

- 카드 서비스 모바일 변경이므로 모바일 lint/typecheck와 parity 검증을 수행한다.
- 작업 후 main PR/merge까지 진행한다.

## 진행

- `card-deck-list-sections.tsx`를 추가해 헤더, 이어서 학습 카드, 게스트 동기화 배너, 덱 목록 상태 분기, 생성 바텀시트를 분리했다.
- `CardDeckListScreen`은 `useCardDeckListState` 결과를 섹션 컴포넌트에 전달하는 조립 컴포넌트로 축소했다.
- 백로그 항목 191을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 구조 증거 스크립트: 300개 TODO 유지, 191번 완료 표시, 화면 52라인 축소 및 섹션 컴포넌트 분리 확인

## 결과

- 백로그 항목 191 완료.
- 완료 수: 174/300. 다음 미완료 시작: 192.
