# 카드방 다인(2-browser) E2E 검증

작성일: 2026-06-03

## 배경

카드방은 colyseus(race-server) 기반 실시간 협동 학습 기능이다. 단위/karate 테스트는 백엔드 흐름을 덮지만, **웹 클라이언트의 실시간 다인 흐름(호스트+봐주는 사람 2명이 동시에 입장→준비→시작→공개→결과→다음→종료)** 은 자동 검증이 없다. `typing-room-online.spec.ts`가 동일 구조(타자방 colyseus 2-browser)의 검증 템플릿으로 존재한다.

## 1차: 카드방 2-browser E2E 스펙 + 격리 실행

### 작업내용

- `apps/web/e2e/card-room-online.spec.ts` 신규: `RUN_CARD_ROOM_ONLINE_E2E=1` skip-gate(풀스택 필요), 2개 `browser.newContext()`로 호스트(외우는 사람)+봐주는 사람을 동시 구동.
- 게스트 정체성은 컨텍스트별 distinct localStorage 주입(`yeon-card-room-guest-id`, `yeon-card-room-profile`). 호스트는 IndexedDB에 게스트 덱(2장) 시드 후 방 생성.
- 실시간 동기화·정책 가드 검증: 준비 전 시작 불가, 공개→뒷면 노출, OK는 봐주는 사람·포기는 외우는 사람, 다음 카드 진행, 마지막 카드 후 종료.
- 격리 실행: 사용자 Expo(8081)/web(3000)/race(2567)를 건드리지 않고 Spring(18081)+race(12567)+web(3100)+기존 postgres(5432)로 별도 기동해 검증.

### 논의 필요

- 실시간 타이밍 flakiness. typing 스펙처럼 넉넉한 timeout + 상태 폴링으로 완화.
- 이 스펙은 CI 기본 실행에서 제외(skip-gate). 풀스택 필요해 수동/전용 잡에서만.

### 선택지

1. 스펙 작성+커밋, 격리 실행 검증 — 추천(사용자 선택)
2. 풀스택 새로 기동 라이브 검증
3. 스펙만 커밋

### 추천 / 사용자 방향

선택지 1. 스펙을 durable 자산으로 커밋하고 격리 스택으로 실제 통과 검증.
