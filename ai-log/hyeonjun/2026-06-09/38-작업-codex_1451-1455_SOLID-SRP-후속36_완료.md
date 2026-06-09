# SOLID SRP 후속 36

## 목표

- 백로그 항목 190을 완료한다.
- 모바일 `CardDeckListScreen`의 query/create sheet/event hook 책임을 별도 hook으로 분리한다.

## 제약

- 카드 서비스 모바일 변경이므로 모바일 lint/typecheck와 parity 검증을 수행한다.
- 작업 후 main PR/merge까지 진행한다.

## 진행

- `useCardDeckListState` hook을 추가해 세션 소비, repository 조립, 목록 query, 덱 생성 mutation, create sheet 상태, navigation handler를 담당하게 했다.
- `CardDeckListScreen`은 hook 결과를 받아 헤더/배너/목록/바텀시트 렌더링을 조립하도록 축소했다.
- 백로그 항목 190을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 구조 증거 스크립트: 300개 TODO 유지, 190번 완료 표시, 화면 직접 query/mutation/state 제거 및 `useCardDeckListState` 분리 확인

## 결과

- 백로그 항목 190 완료.
- 완료 수: 173/300. 다음 미완료 시작: 191.
