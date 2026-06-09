# SOLID SRP 후속 35

## 목표

- 백로그 항목 189를 완료한다.
- 모바일 카드 덱 목록의 `DeckCard` 컴포넌트가 화면 hook 책임과 분리됐는지 현재 코드 근거로 확인한다.

## 제약

- 이번 차수는 34차 코드 분리 결과를 근거로 백로그 상태를 정정한다.
- 작업 후 main PR/merge까지 진행한다.

## 진행

- `DeckCard`가 `card-deck-list-deck-card.tsx`로 분리되어 있음을 확인했다.
- `DeckCard`에는 hook 호출이 없고, props 기반 카드 행 렌더링만 담당함을 확인했다.
- `CardDeckListScreen`은 query/session/create sheet 흐름을 소유하고 카드 행 렌더링은 전용 컴포넌트에 위임한다.
- 백로그 항목 189를 완료 처리했다.

## 검증

- 구조 증거 스크립트: 300개 TODO 유지, 189번 완료 표시, `DeckCard` 전용 파일 분리 및 hook 호출 없음 확인
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 결과

- 백로그 항목 189 완료.
- 완료 수: 172/300. 다음 미완료 시작: 190.
