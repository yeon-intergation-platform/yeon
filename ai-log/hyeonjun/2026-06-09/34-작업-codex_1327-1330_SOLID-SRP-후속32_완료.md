# SOLID SRP 후속 32

## 목표

- 백로그 항목 186을 완료한다.
- 모바일 `CardDeckDetailScreen`의 sheet/form/menu 상태 책임을 hook으로 분리한다.

## 제약

- 카드 서비스 모바일 변경이므로 모바일 lint/typecheck와 parity 검증을 수행한다.
- 작업 후 main PR/merge까지 진행한다.

## 진행

- `useCardDeckDetailSheetState` hook을 추가해 수동/일괄 입력값, sheet mode/state, 활성 메뉴 상태와 open/close/toggle 액션을 담당하게 했다.
- `CardDeckDetailScreen`은 hook 결과를 사용하도록 정리하고, 기존 상세 조회 hook 분리 흐름은 유지했다.
- 백로그 항목 186을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 구조 증거 스크립트: 300개 TODO 유지, 186번 완료 표시, sheet 상태 hook 분리 확인

## 결과

- 백로그 항목 186 완료.
- 완료 수: 169/300. 다음 미완료 시작: 187.
