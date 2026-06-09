# SOLID SRP 후속 33

## 목표

- 백로그 항목 187을 완료한다.
- 모바일 `CardDeckDetailScreen`의 긴 함수에서 검증/변환/부수효과 책임을 hook으로 분리한다.

## 제약

- 카드 서비스 모바일 변경이므로 모바일 lint/typecheck와 parity 검증을 수행한다.
- 작업 후 main PR/merge까지 진행한다.

## 진행

- `useCardDeckDetailActions` hook을 추가해 mutation, deck invalidation, 입력 검증, alert, submit/delete handler, 버튼 pending label을 담당하게 했다.
- `useCardServiceResolvedSession` hook을 추가해 세션 bootstrap 부수효과를 화면 밖으로 분리했다.
- `CardDeckDetailScreen`은 repository/query/sheet/action hook 결과를 받아 렌더링을 조립하도록 축소했다.
- 백로그 항목 187을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 구조 증거 스크립트: 300개 TODO 유지, 187번 완료 표시, action/session hook 분리 확인

## 결과

- 백로그 항목 187 완료.
- 완료 수: 170/300. 다음 미완료 시작: 188.
