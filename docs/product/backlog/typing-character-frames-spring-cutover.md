# typing-character-frames Spring 전환 계획

## 배경

`typing-character-frames` API route 2개는 아직 Next route가 `@/server/repositories/typing-character-frame-overrides-repository`를 직접 import해서 DB를 조회/수정한다. Next 백엔드 역할 제거 계획의 첫 잔여 route 묶음으로 Spring으로 이전한다.

## 1차 — Spring API 추가 및 Next route 얇은 proxy화

### 작업내용

- Spring에 `typing_character_frames` 도메인 controller/service/repository를 추가한다.
- `GET /typing-character-frames`가 override 목록을 반환한다.
- `PUT /typing-character-frames/{characterId}`가 frame slot override를 upsert/delete한다.
- 관리자 권한 판정은 Spring service에서 `public.users.role` 및 seed admin email 기준으로 수행한다.
- Next route는 current user id 전달과 Spring 응답 매핑만 담당한다.
- Spring Flyway에 `public.typing_character_frame_overrides` 보장 migration을 추가한다.

### 논의 필요

- 기존 Next auth session 자체도 Spring으로 이전해야 하지만, 이번 차수는 typing-character-frames route의 DB/repository 직접 접근 제거까지만 수행한다.

### 선택지

- A. Next에서 admin 판정을 유지하고 Spring은 DB write만 담당한다.
- B. Next는 user id만 전달하고 Spring이 admin 판정과 DB write를 담당한다.
- C. 인증 세션까지 이번 차수에서 Spring으로 이동한다.

### 추천

B. Next의 권한 판정 원천을 줄이면서도 인증 세션 전체 이전이라는 큰 범위 확장을 피한다.

### 사용자 방향

비어 있으면 B로 진행한다.
