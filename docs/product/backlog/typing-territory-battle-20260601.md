# 타자 점령전 구축 백로그

기준일: 2026-06-01

## 1차수: 기획/체크리스트/공유 규칙 고정

### 작업내용

- 타자 점령전 기획 문서를 작성한다.
- 300개 체크리스트를 작성한다.
- `packages/race-shared`에 점령전 타입/상수/순수 helper를 추가한다.
- deterministic board, scoring, winner 계산 테스트를 작성한다.

### 논의 필요

- v0.1에서 Phaser를 바로 쓸지, React board로 규칙 검증 후 전환할지.

### 선택지

1. Phaser를 바로 적용한다.
2. React board로 서버 규칙을 먼저 검증한다.

### 추천

- 2번. 실시간 판정과 점수 규칙을 먼저 안정화한 뒤 Phaser를 적용한다.

### 사용자 방향

- 300개 체크리스트 전체 진행.

## 2차수: 웹 프로토타입

### 작업내용

- `typing.yeon.world` 홈에 점령전 CTA를 추가한다.
- `/typing-service/territory` route를 추가한다.
- local board prototype을 구현한다.
- 입력 성공/실패/점수 변화를 확인한다.

### 논의 필요

- 이미지처럼 경기장 배경을 넣을지, Yeon 규칙대로 플레이 영역에만 픽셀 감성을 제한할지.

### 선택지

1. 전체 화면을 픽셀 경기장으로 만든다.
2. 앱 셸은 흰 배경, 보드 영역만 게임 감성으로 만든다.

### 추천

- 2번. 기존 typing-service 디자인 규칙과 장기 유지보수에 맞다.

### 사용자 방향

- 게임처럼 잘 작동해야 한다.

## 3차수: 실시간 서버와 운영 검증

### 작업내용

- `apps/race-server`에 `TerritoryBattleRoom`을 추가한다.
- Colyseus 이벤트를 shared protocol과 맞춘다.
- web hook을 연결한다.
- local/운영 WebSocket smoke test를 수행한다.
- PR merge 후 main 배포를 확인한다.

### 논의 필요

- 결과 저장을 v0.1에 넣을지 후속으로 둘지.

### 선택지

1. 결과 저장 없이 실시간 게임 완성.
2. 결과 저장까지 포함.

### 추천

- 1번. 저장은 Spring API/DB 설계가 필요하므로 후속으로 분리한다.

### 사용자 방향

- 모든 단계 진행.
