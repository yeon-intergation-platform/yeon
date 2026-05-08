# Spring First Pilot — Space Templates

## 문서 목적
- Spring backend로 **처음 실제 도메인 이전**을 시작할 때 어떤 API 묶음을 파일럿으로 삼을지 고정한다.
- 이번 문서는 “전면 이전”이 아니라 **첫 파일럿 범위**만 정의한다.
- 목적은 Spring bootstrap이 실제 업무 API를 1개라도 안전하게 소유하기 시작하도록 만드는 것이다.

## 왜 `space-templates`를 첫 파일럿으로 고르나

### 관찰 근거
- `apps/web/src/server/services/space-templates-service.ts`
  - 약 `812` lines
- 관련 route가 이미 명확히 묶여 있음
  - `/api/v1/space-templates`
  - `/api/v1/space-templates/[templateId]`
  - `/api/v1/space-templates/[templateId]/duplicate`
  - `/api/v1/spaces/[spaceId]/apply-template`
  - `/api/v1/spaces/[spaceId]/snapshot-template`
- `counseling-records-service.ts`는 약 `1666` lines로 첫 파일럿치고 너무 큼
- `public-check-service.ts`는 약 `707` lines지만
  - token 기반 public 접근
  - remembered identity cookie
  - verify/submit 분기
  가 섞여 있어 첫 이관에서 인증/쿠키 경계까지 흔들 가능성이 큼

### 선택 이유
1. **업무 가치가 있음**
   - 상담 워크스페이스에서 실제로 쓰는 도메인이다.
2. **복잡도는 중간**
   - 단순 CRUD보다 풍부하지만, 파일 업로드/AI/외부 OAuth보다 안전하다.
3. **도메인 경계가 선명함**
   - template 목록/상세/복제/스냅샷/적용으로 묶인다.
4. **Spring으로 옮겼을 때 이득이 분명함**
   - transaction 경계
   - 템플릿/탭/필드 생성 로직 구조화
   - 이후 spaces/members 이전의 전초기지 역할

## 이번 backlog에서의 최종 결론
- 첫 Spring 파일럿 도메인: **`space-templates`**
- 단, **첫 구현 턴은 read-only부터 시작**한다.

## 비목표
- counseling-records 이전 시작 금지
- public-check 이전 시작 금지
- auth source of truth 변경 금지
- file upload, AI, external integration 포함 금지
- DB ownership을 public schema 전체로 넓히는 작업 금지

---

## 차수 1 — 파일럿 경계 고정

### 작업내용
- `space-templates` 관련 route/service/DB 연관 파일을 목록화한다.
- Spring이 1차로 소유할 API와 아직 Next에 남길 API를 나눈다.

### 논의 필요
- read-only를 어디까지로 볼지
- template detail까지 포함할지

### 선택지
1. 목록만
2. 목록 + 상세
3. 목록 + 상세 + duplicate까지

### 추천
- **2. 목록 + 상세**

### 사용자 방향
- 추천 기준으로 진행

---

## 차수 2 — 1차 API 범위 확정

### 작업내용
- Spring 1차 소유 범위를 아래 2개로 제한한다.
  - `GET /api/v1/space-templates`
  - `GET /api/v1/space-templates/{templateId}`
- Next는 당분간 BFF로 남아 Spring API를 호출한다.

### 논의 필요
- duplicate/apply-template/snapshot-template를 1차에 묶을지

### 선택지
1. GET 2개만
2. GET 2개 + duplicate
3. 전체 route 한번에

### 추천
- **1. GET 2개만**

### 사용자 방향
- 추천 기준으로 진행

---

## 차수 3 — source of truth 분리 전략

### 작업내용
- template 조회의 source of truth를 Next Drizzle 서비스에서 Spring service로 옮기는 설계를 문서화한다.
- 다만 route contract는 최대한 유지한다.

### 논의 필요
- `packages/api-contract`에 새 contract를 둘지
- 기존 JSON shape를 그대로 유지할지

### 선택지
1. 기존 응답 shape 유지
2. Spring 표준 DTO로 재설계

### 추천
- **1. 기존 응답 shape 유지**

### 사용자 방향
- 추천 기준으로 진행

---

## 차수 4 — DB ownership 설계

### 작업내용
- `space_templates`, 탭/필드 정의 관련 테이블 중
  - 조회만 Spring이 읽는 단계
  - 쓰기 ownership 이전 단계
를 분리한다.

### 논의 필요
- 첫 파일럿에서 기존 Next schema를 직접 읽을지
- Spring 전용 projection/table을 둘지

### 선택지
1. 기존 schema read-only 접근
2. projection/table 별도 생성

### 추천
- **1. 기존 schema read-only 접근**

### 사용자 방향
- 추천 기준으로 진행

---

## 차수 5 — Spring 내부 구조 초안

### 작업내용
- `apps/backend`에 `space-templates` read 전용 패키지 구조 초안을 잡는다.
- 예:
  - controller
  - service
  - repository
  - dto

### 논의 필요
- JPA projection 중심인지
- query service 분리형인지

### 선택지
1. controller/service/repository 기본 layered
2. query-service 분리

### 추천
- **1. 기본 layered**

### 사용자 방향
- 추천 기준으로 진행

---

## 차수 6 — 계약/응답 테스트 전략

### 작업내용
- `GET /space-templates`와 `GET /space-templates/{id}`의 contract test 전략을 정한다.
- 기존 Next 응답과 Spring 응답을 비교 가능한 fixture를 준비한다.

### 논의 필요
- fixture source를 mock으로 둘지
- 실제 DB snapshot 기반으로 둘지

### 선택지
1. mock fixture
2. local DB fixture
3. 둘 다

### 추천
- **3. 둘 다**

### 사용자 방향
- 추천 기준으로 진행

---

## 차수 7 — Next BFF cutover 전략

### 작업내용
- Next route가 직접 Drizzle service를 부르는 대신 Spring backend를 호출하도록 바꾸는 cutover 단계를 정의한다.
- feature flag 없이 갈지, env switch로 갈지 정한다.

### 논의 필요
- rollout 중 fallback 필요 여부

### 선택지
1. env switch
2. feature flag
3. hard cutover

### 추천
- **1. env switch**

### 사용자 방향
- 추천 기준으로 진행

---

## 차수 8 — 검증/중단 규칙

### 작업내용
- 첫 파일럿 완료 기준과 중단 기준을 명시한다.

### 논의 필요
- duplicate/write API를 언제 열지

### 선택지
1. read-only 성공 후 다음 backlog
2. read/write 한번에

### 추천
- **1. read-only 성공 후 다음 backlog**

### 사용자 방향
- 추천 기준으로 진행

## 첫 파일럿 완료 기준
- Spring backend에서 `GET /space-templates` 동작
- Spring backend에서 `GET /space-templates/{templateId}` 동작
- Next BFF가 위 두 API를 Spring 호출로 중계
- 기존 UI에서 템플릿 목록/상세가 회귀 없이 보임
- backend test + web smoke 증거 확보

## 중단 규칙
- auth/session source of truth 변경 요구가 들어오면 중단
- template write API까지 한 번에 넣으려 하면 중단
- spaces/members 도메인까지 확장하려 하면 중단
- DB schema ownership을 쓰기 기준으로 바로 뒤집으려 하면 중단

## 다음 1작업 추천
- 이 backlog 다음엔
  **`space-templates` 파일럿용 route/service/DB mapping inventory 문서 1개**
  만 만들고 멈춘다.
