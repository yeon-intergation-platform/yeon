# Bugsink 오류 수집 도입 백로그

## 1차: Yeon 웹/백엔드 Bugsink 연결

### 작업내용

- Bugsink는 Sentry SDK 호환 에러 트래커로 보고, 기존 `@sentry/nextjs` 설정은 유지하되 DSN 주석과 샘플링을 Bugsink 운용에 맞춘다.
- Bugsink가 error events 중심이고 traces를 처리하지 않는 점을 반영해 웹 trace 샘플링을 0으로 낮춘다.
- Spring backend에는 Sentry Java SDK를 추가하고 `SENTRY_DSN` 기반 no-op 기본값으로 운영 오류 수집을 활성화한다.
- `.env.example`과 배포 문서에 Yeon용 Bugsink 프로젝트 DSN 항목을 기록한다.

### 논의 필요

- Bugsink 인스턴스의 실제 호스트명과 프로젝트 DSN은 현재 저장소에 둘 수 없다.
- 모바일/레이스 서버까지 이번 차수에 포함할지 여부가 남아 있다.

### 선택지

- A. 웹/백엔드만 먼저 도입하고 모바일/레이스 서버는 후속 차수로 분리한다.
- B. 웹/백엔드/모바일/레이스 서버 전체에 SDK를 한 번에 넣는다.

### 추천

- A. 이미 웹에는 Sentry SDK가 있고 Spring backend가 핵심 장애 수집 대상이므로, 이번 차수는 웹/백엔드로 좁혀 안전하게 넣는다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차: 운영 연결 문서화

### 작업내용

- Bugsink 프로젝트는 `yeon-web`, `yeon-backend`처럼 런타임별로 분리한다.
- 실제 DSN은 배포 환경변수로만 주입하고 저장소에는 빈 예시만 둔다.
- 소스맵 업로드 토큰은 Sentry SaaS 전용이므로 Bugsink만 쓸 때는 필수값이 아니라고 문서화한다.

### 논의 필요

- Bugsink 서버 자체를 Yeon 인프라 저장소에 둘지, 별도 운영 레포에 둘지 결정이 필요하다.

### 선택지

- A. 앱 저장소에는 SDK 연결만 두고 Bugsink 서버 compose는 별도 인프라 문서로 둔다.
- B. Yeon 저장소에 `infra/bugsink` compose까지 둔다.

### 추천

- A. 두 레포가 같은 Bugsink를 바라볼 가능성이 높으므로 앱 저장소에 self-host 서버 정의를 묶지 않는다.

### 사용자 방향

- 추천 기준으로 진행한다.
