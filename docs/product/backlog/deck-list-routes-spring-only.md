# deck list routes Spring-only cutover

## 1차

### 작업내용
- `/api/v1/card-decks` GET의 Spring 실패 시 Next DB fallback을 제거하고 Spring 응답만 사용한다.
- `/api/v1/typing-decks` GET의 Spring 실패 시 Next DB fallback을 제거하고 Spring 응답만 사용한다.
- 기본 타자 덱(`scope=default`)은 DB 소유권이 아닌 정적 프론트 번들 응답이므로 유지한다.
- route 테스트를 Spring-only 경계에 맞게 갱신한다.

### 논의 필요
- Spring 장애 시 Next DB fallback이 없어지므로 로컬/운영 모두 Spring backend 연결 상태가 더 명확한 필수 조건이 된다.

### 선택지
1. fallback만 제거해서 Next route의 DB 소유권을 바로 없앤다.
2. 더 큰 deck 상세/자산 route까지 한 번에 묶는다.

### 추천
- 1번. 이미 Spring list/create API가 존재하므로 route-level service import를 작은 단위로 줄인다.

### 사용자 방향
- 추천 기준으로 진행한다.
