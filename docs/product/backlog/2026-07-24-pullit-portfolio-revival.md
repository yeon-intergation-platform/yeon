# PULL-IT 포트폴리오 경로 복구 백로그

## 목표

- PULL-IT 프론트엔드, Spring 백엔드, 문서 서버를 다시 유지보수 가능한 저장소와 실행 구조로 복구한다.
- 최종 공개 주소를 `https://portfolio.yeon.world/pull-it`으로 통일한다.
- 외부 키는 환경변수로 지연 주입하고, 키가 없어도 빌드와 정적 경로 검증이 가능하게 한다.
- 기존 `portforlio.yeon.world`는 호환 주소로 유지하고 정상 철자 호스트로 전환할 수 있는 라우팅 계약을 만든다.

## 1차 — 저장소 소유권과 실행 기준 복구

### 작업내용

- Team2_FE와 Team2_BE를 개인 계정에서 유지보수 가능한 저장소로 포크 또는 미러링한다.
- 세 저장소의 기본 브랜치, 빌드 명령, 런타임 의존성과 누락된 키 목록을 확정한다.
- 기존 데이터 복구와 신규 빈 데이터베이스 시작을 구분한다.

### 논의 필요

- 기존 MariaDB 백업과 S3 객체를 확보할 수 있는지 여부.

### 선택지

- A. 기존 데이터 백업을 연결해 과거 사용자와 문제 세트를 복구한다.
- B. 신규 데이터베이스로 서비스를 재시작한다.

### 추천

- 코드와 배포를 먼저 복구하고, 데이터 백업이 확인되면 별도 복원 절차로 연결한다.

### 사용자 방향

- 필요한 키는 사용자가 나중에 설정하며, 나머지 복구 작업은 즉시 진행한다.

## 2차 — `/pull-it` 서브패스 계약 적용

### 작업내용

- 프론트에 Vite base와 React Router basename을 적용한다.
- API, OAuth, SSE, 로그인 성공 경로를 `/pull-it` 기준으로 통일한다.
- Spring의 OAuth callback, redirect allowlist, refresh cookie path와 cookie domain을 환경변수화한다.
- 문서 서버의 정적 자산, 문서 API, OpenAPI 주소를 base path 기준으로 계산한다.

### 논의 필요

- 문서 편집용 PostgreSQL을 기존 Vercel 환경에 유지할지 자체 호스팅할지 여부.

### 선택지

- A. 문서 서버는 기존 Vercel 런타임을 유지하고 Yeon에서 프록시한다.
- B. 문서 서버와 PostgreSQL도 Yeon 운영 호스트로 이전한다.

### 추천

- 초기 복구에서는 A를 사용하고, 서비스 기능 검증 후 자체 호스팅 여부를 결정한다.

### 사용자 방향

- 세 서비스를 모두 `portfolio.yeon.world/pull-it` 아래에서 사용할 수 있게 한다.

## 3차 — Yeon 라우팅과 포트폴리오 진입점

### 작업내용

- 정상 철자 `portfolio.yeon.world`를 포트폴리오 canonical host로 등록한다.
- 기존 오타 호스트는 정상 철자 호스트로 308 전환한다.
- `/pull-it` 프론트, 백엔드 특수 경로, 문서 경로를 독립 origin으로 프록시한다.
- 포트폴리오 PULL-IT 프로젝트 CTA를 복구 주소로 연결한다.

### 논의 필요

- PULL-IT 런타임 origin의 최종 내부 서비스명과 포트.

### 선택지

- A. Yeon 운영 compose에 PULL-IT 런타임을 포함한다.
- B. 별도 compose로 실행하고 같은 Docker network에서 Yeon web이 프록시한다.

### 추천

- 장애 격리를 위해 B를 사용하고, 공용 reverse proxy 계약만 Yeon이 소유한다.

### 사용자 방향

- 새 도메인은 구매하지 않고 기존 `yeon.world` 하위 호스트와 `/pull-it` 경로를 사용한다.

## 4차 — 검증, 병합, 운영 활성화

### 작업내용

- FE/BE/docs 빌드와 테스트를 실행한다.
- 로컬 프록시에서 SPA deep link, OAuth callback, refresh cookie, SSE, OpenAPI 문서를 검증한다.
- Yeon lint, typecheck, 관련 라우팅 테스트와 프로덕션 빌드를 통과시킨다.
- 각 저장소를 커밋·push하고 PR을 병합한다.
- 키와 데이터 저장소가 준비된 뒤 런타임을 활성화하고 운영 smoke test를 수행한다.

### 논의 필요

- Kakao, Gemini, S3, 데이터베이스 실키와 기존 데이터 백업 제공 시점.

### 선택지

- A. 키 없이 코드와 이미지까지만 먼저 배포한다.
- B. 키가 모두 준비된 뒤 한 번에 공개한다.

### 추천

- 키가 없는 상태에서는 공개 프록시를 활성화하지 않고 코드·이미지·DNS 준비까지만 병합한다.

### 사용자 방향

- 키는 나중에 설정하며, 키 이외의 작업은 먼저 완료한다.

## 완료 조건

- [x] 세 저장소가 개인 계정에서 유지보수 가능하다.
- [x] `/pull-it` 기준의 FE·BE·docs 경로 테스트가 통과한다.
- [x] Yeon에 정상 철자 포트폴리오 호스트와 PULL-IT 프록시 계약이 반영된다.
- [x] 키와 데이터 백업이 없어서 남는 항목이 환경변수 목록과 복원 절차로 명확히 기록된다.

## 실행 결과

- Cloudflare DNS와 원격 tunnel ingress를 정상 철자 host로 등록했다.
- 외부 origin이 비어 있으면 `/portfolio/pull-it` 안내 화면을 제공하고,
  origin이 설정되면 같은 공개 URL에서 자동으로 PULL-IT을 프록시한다.
- 기존 오타 host는 정상 철자 host로 308 이동한다.
- 키 입력과 데이터 복원은 저장소별 `.env.example`을 기준으로 후속 진행한다.

## 롤백

- `portfolio.yeon.world/pull-it` 프록시를 비활성화하고 기존 포트폴리오만 유지한다.
- 오타 호스트 redirect를 제거하고 기존 host rewrite로 되돌린다.
- PULL-IT 런타임 compose를 중지해도 Yeon 본 서비스에는 영향이 없도록 독립 실행한다.
