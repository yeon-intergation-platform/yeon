# 카드방 실제화 1차 백로그

## 1차: Spring 카드방 SSOT와 웹/실시간 수직 연결

### 작업내용
- `packages/api-contract`에 카드방 생성/목록/상세/입장/프로필/채팅/결과 계약을 추가한다.
- Spring `apps/backend`에 `/api/v1/card-rooms` API, 카드방/참가자/카드 스냅샷/메시지/결과 Flyway 테이블을 추가한다.
- `apps/race-server`에 카드방 Colyseus room을 추가해 Spring 방 상태를 기준으로 채팅, OK, 포기, 공개, 다음 카드 상태를 브로드캐스트한다.
- `apps/web` 카드방 화면에서 샘플 fixture/query 기반 상태와 타자방 프로필 재사용을 제거하고 실제 Spring/BFF/race-server 상태를 렌더링한다.

### 논의 필요
- 게스트 카드방의 장기 보관/만료 정책은 아직 확정되지 않았다.
- 음성 답변/녹음은 이번 차수에서 제외한다.

### 선택지
1. 전체 카드방 기능을 Spring 영속 + race-server 동기화까지 한 번에 구현한다.
2. Spring 영속 API와 웹 방 생성/입장까지만 먼저 구현하고 실시간은 다음 차수로 미룬다.
3. UI skeleton만 정리하고 백엔드 계약은 문서화에 그친다.

### 추천
- 1번. 샘플/로컬 상태 제거가 핵심이므로 최소 수직 슬라이스라도 Spring과 race-server까지 연결해야 한다.

### 사용자 방향
- 이전 계획 기준으로 1번을 진행한다.
