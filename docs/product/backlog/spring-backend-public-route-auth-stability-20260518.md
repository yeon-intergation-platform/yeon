# Spring backend 공개 route 및 인증 안정화 백로그

## 1차

### 작업내용
- Cloudflare Tunnel Published application routes에 Spring backend 전용 도메인을 추가할지 검토한다.
- 후보 도메인: `api.yeon.world` 또는 `backend.yeon.world`.
- route 대상 후보: `http://yeon-prod-backend:8081`.
- 공개 route를 추가하더라도 브라우저-facing OAuth callback은 기존처럼 Next `/api/auth/<provider>/callback`을 유지한다.
- Spring 공개 route는 서버 상태 확인, API 직접 진단, 모바일/외부 클라이언트 전환 가능성, 인증 이전 후 장애 분리 목적으로만 사용한다.
- 내부 BFF 호출은 계속 compose network의 `http://backend:8081` 또는 `SPRING_BACKEND_BASE_URL`을 기본으로 유지한다.

### 논의 필요
- 공개 도메인 이름을 `api.yeon.world`로 할지 `backend.yeon.world`로 할지 결정해야 한다.
- Spring actuator/내부 API 노출 범위를 점검해야 한다.
- Cloudflare Access나 Spring Security에서 공개 허용 endpoint와 내부 token 필요 endpoint를 분리할지 확인해야 한다.

### 선택지
- A. `api.yeon.world`를 Spring backend public route로 추가한다.
- B. `backend.yeon.world`를 Spring backend public route로 추가한다.
- C. Spring은 계속 비공개로 두고 Next BFF만 통해 접근한다.

### 추천
- A를 추천한다. `api.yeon.world`가 향후 모바일/외부 클라이언트 전환에도 자연스럽고, 현재 `db.yeon.world`, `race.yeon.world`와도 역할이 명확하다.
- 단, OAuth provider redirect URI에는 Spring URL을 등록하지 않는다. Kakao/Google root login callback은 계속 `https://yeon.world/api/auth/<provider>/callback`이다.

### 사용자 방향
- 사용자가 먼저 Spring backend public route 계획을 세우자고 지시했다. 추천 기준은 `api.yeon.world -> http://yeon-prod-backend:8081` 추가 후 보안 노출면 점검이다.

## 2차

### 작업내용
- 1차 route 결정을 반영한 뒤, 기존 카드 저장 401/redirect loop 대응을 이어서 수행한다.
- `compose.prod.yml`/`compose.dev.yml`에서 backend에 Kakao env가 전달되는지 수정한다.
- host-only/domain 중복 `yeon.session` 쿠키가 남아도 cleanup loop가 발생하지 않도록 세션 후보 검증과 쿠키 정리를 보강한다.
- 카드 서비스 PATCH 401에서 내부 구현명 또는 Spring 문구가 사용자에게 노출되지 않게 정규화한다.

### 논의 필요
- 없음. 운영 Kakao env 값은 이미 존재한다고 사용자가 확인했다.

### 선택지
- A. route 추가/보안 점검 후 인증 안정화 코드를 한 PR에 묶는다.
- B. route 추가와 인증 안정화 PR을 분리한다.

### 추천
- B를 추천한다. Cloudflare route/보안 경계와 애플리케이션 쿠키/401 수정은 실패 원인이 달라 롤백 단위도 분리하는 편이 안전하다.

### 사용자 방향
- 1차 route 계획 확정 후 진행한다.
