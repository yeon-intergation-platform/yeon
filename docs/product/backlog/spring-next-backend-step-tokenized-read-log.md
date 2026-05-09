# 차수 1~60 토큰 처리 기록

- 처리 방식: `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`와 `docs/product/backlog/spring-next-backend-60steps-execution-log.md`를 차수 단위로 1~60 순차 검수
- 생성일시: 2026-05-09

| 차수 | 상태 | 처리 방식 | 핵심 작업 | 처리 근거 | 다음 처리 |
|---:|---|---|---|---|---|
| 1 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | 이관 범위를 공식 freeze. `apps/web/src/app/api/v1`는 이관 대상, `apps/race-server`는 대상 제외 범위… | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 2 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | 이관 완료의 DoD 정의. 라우트 커버리지, 회귀 테스트, 관측 지표, 롤백 조건을 문서화. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 3 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | API 계약(요청/응답, 상태코드, 에러코드) 현재 동작 스냅샷 고정. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 4 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `@/server/services` 의존도 전수조사(도메인별, 함수별, 테스트 영향도). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 5 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | 인증/세션 경계 SSOT 문서화(쿠키, bearer, OAuth callback, `cookie set/clear`). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 6 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `apps/backend` 패키지/레이어 아키텍처 고정(Controller, Service, Repository, Domain, Infra). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 7 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | 에러 응답/검증 규격 통일(`ControllerAdvice`, `ErrorCode`, validation). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 8 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | 공통 보안·감사·로깅 규칙 확정(PII 마스킹, 요청 ID, 트레이스 ID). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 9 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | 배포/실행 경계 및 readiness 기본(health) 계약 확정(로컬/개발). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 10 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | 테스트 전략 확정(유닛/통합/컨트랙트/Smoke). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 11 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `spaces` 1차 도메인 이관(조회/기본 CRUD) 대상 정의 및 우선순위 확정. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 12 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `spaces` 라우트(약 30개) 중 조회/목록 우선 마이그레이션 1. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 13 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `spaces` 쓰기/수정/삭제 라우트 마이그레이션(회원 권한/공간 소유권 포함). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 14 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `space-templates` 라우트(3개) 이전 및 템플릿 생성/복제 규칙 동등성 확인. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 15 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `members` 라우트 이전(회원 기본 조회/관리 라우트 1개군). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 16 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `users` 라우트 이전 및 사용자 기본 식별 규칙 정합성 검사. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 17 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `auth` 라우트 이전(로그인/상태 체크 계열), 브라우저 인증 상태 동기화 규칙 고정. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 18 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `typing-decks` 라우트(전체 6개) 이전: 목록/상세/passage/레이스 seed 기본경로. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 19 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `typing-character-frames` 2개 라우트 이전과 정적 데이터 배치 전략 확정. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 20 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `card-decks` 라우트(10개) 중 조회/생성/수정/삭제 핵심 CRUD 이전. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 21 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `card-decks/assets` 및 저장 객체 경로 이전. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 22 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `card-decks` merge-guest 카드 동작 이전(병합/초안/초기값 경계). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 23 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `public-check-sessions` 라우트(4개) 이전: 토큰 경로, verify/submit/동작 동등성 점검. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 24 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `integrations/local` 라우트(분석, 임시저장, 업로드) 이전. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 25 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `integrations/onedrive` 라우트 이전 및 권한 토큰 재사용 플로우 정합성 확인. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 26 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `integrations/googledrive` 라우트 이전(분석/임포트/인증 포함). | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 27 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `counseling-records` 라우트(11개) 중 목록/상세/분석 라우트 이전. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 28 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `counseling-records` 라우트(세그먼트, transcribe, 오디오) 마이그레이션 완료 및 대용량 분석 분기 점검. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 29 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | `chat-service` 핵심 라우트(rooms/feed/ask/friends/profiles/reports + auth) 이전. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 30 | 완료(백로그 기준 정의 반영) | 1차 토큰 순차 읽기 완료 | 전량 마이그레이션 후 Next 스크립팅 정리(라우트 제거/포워드, 스프링 타겟 라우트 고정, 회귀 테스트 패키지 정리) 및 운영 전환. | `docs/product/backlog/spring-next-backend-full-migration-30-steps.md`(차수 정의) | step-by-step 구현/검증 수행 |
| 31 | 완료(정합성 스캔) | 1차 토큰 순차 읽기 완료 | 1차 이관 라우트 목록과 Spring 라우트 매핑의 완전성 점검(누락/중복/중복 처리 경로 제거). | `docs/product/backlog/spring-next-backend-step31-completeness.md`(route 111개 기준) | 각 service 직접 의존 라우트 46개를 우선 타겟으로 순차 정리 |
| 32 | 완료(에러 계약 스냅샷) | 1차 토큰 순차 읽기 완료 | `ServiceError`/HTTP 상태 코드/메시지 동등성 회귀 스위트 작성(`401/403/404/409/500` 중심). | `docs/product/backlog/spring-next-backend-step32-error-equivalence.md`(ServiceError 대상 13개) | 13개 라우트의 상태/메시지 동등성 스냅샷 수집 |
| 33 | 완료(타입 점검) | 1차 토큰 순차 읽기 완료 | 분기/조건식 로직에서 생긴 데이터 타입 변화(날짜, 정렬, null 처리) 회귀 검사. | `docs/product/backlog/spring-next-backend-step33-type-compatibility.md`(query/body/변환 의심 라우트) | 수치/날짜/정렬 경로별 회귀 시나리오 확정 |
| 34 | 완료(브릿지 범위 확인) | 1차 토큰 순차 읽기 완료 | 통합 인증/세션 브릿지 라우트의 브라우저 호환성 테스트(로그인 후 즉시 재요청/탭 전환/쿠키 갱신). | `docs/product/backlog/spring-next-backend-step34-auth-bridge-check.md`(인증 의존 라우트/브릿지 라우트 추출) | 브라우저 호환성 테스트 케이스를 채팅/auth 브릿지 중심으로 구성 |
| 35 | 완료(멱등성 후보 추출) | 1차 토큰 순차 읽기 완료 | `spaces`, `counseling-records`, `card-decks`의 중요 작성/수정 라우트에 대한 idempotency 보장 여부… | `docs/product/backlog/spring-next-backend-step35-idempotency-review.md`(mutation 라우트 43건 점검) | POST/PUT/PATCH/DELETE 라우트의 idempotency 정책 수립 |
| 36 | 완료(업로드/스트리밍 추출) | 1차 토큰 순차 읽기 완료 | 업로드/다운로드/대용량 응답 라우트(`integrations`, `counseling-records`, `card-decks`)의 스트리밍/버퍼… | `docs/product/backlog/spring-next-backend-step36-streaming-buffer-review.md`(formData/stream 추정 라우트) | 멀티파트/바이너리 라우트별 버퍼 정책 시나리오 정리 |
| 37 | 완료(추적 헤더 미확보 확인) | 1차 토큰 순차 읽기 완료 | 요청 로그·트레이스 ID·사용자 식별값이 Next→Spring 전 구간에서 동일하게 전달되는지 추적. | `docs/product/backlog/spring-next-backend-step37-trace-id-propagation.md`(직접 추적 헤더 처리 0건) | Next 라우트 공통 미들웨어 후보 및 전달 정책 수립 필요 |
| 38 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 페이징 파라미터(`limit`, `cursor`, `offset`, 정렬) 동작 차이 추출 및 계약 고정. | `docs/product/backlog/spring-next-backend-step38-paging-params-review.md`(searchParams 추출/동일성 체크) | 39차수 동시성 경합 검증으로 전환 |
| 39 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 동시성 높은 Write API(채팅, 카드 저장, 상담 기록 업로드)에서 동시 요청 경합 상태 재현 테스트. | `docs/product/backlog/spring-next-backend-step39-concurrency-write-load.md`(동시성 경합 시나리오) | 40차수 성능 베이스라인 측정 |
| 40 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | Next에서 Spring으로 전환되는 라우트의 성능 베이스라인 수집(TTFB/응답시간/p95, 에러율). | `docs/product/backlog/spring-next-backend-step40-performance-baseline.md`(성능 지표 산정) | 41차수 OpenAPI 동기화 |
| 41 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | OpenAPI/Swagger 계약을 Spring 구현 기준으로 재생성하고 Next API client/테스트의 타입 의존성 점검. | `docs/product/backlog/spring-next-backend-step41-openapi-contract-sync.md`(OpenAPI 갱신/정합성) | 42차수 consumer 패키지 정합성 감사 |
| 42 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | `api-client`/`api-contract` 패키지 버전 정합성 점검과 consumer 빌드 영향도 파악. | `docs/product/backlog/spring-next-backend-step42-consumer-package-version-audit.md`(패키지 버전/빌드 정합성) | 43차수 클라이언트 엔드포인트 호환 점검 |
| 43 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 모바일/타입스크립트/웹 공통 client에서 Spring 전환 엔드포인트 사용 여부 검증. | `docs/product/backlog/spring-next-backend-step43-client-endpoint-compat-check.md`(클라이언트 라우트 맵) | 44차수 OAuth callback URL 감사 |
| 44 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | OAuth 연동 라우트(google drive / onedrive 포함) OAuth callback 경로를 환경별(로컬/프리뷰/운영)로 재확인. | `docs/product/backlog/spring-next-backend-step44-oauth-callback-url-audit.md`(OAuth redirect 규칙 정리) | 45차수 서비스 smoke 테스트 |
| 45 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | `typing-service` 및 `card-service` 핵심 API에 대해 계약 테스트 + smoke 테스트를 분리해 운영 계측. | `docs/product/backlog/spring-next-backend-step45-service-smoke-tests.md`(smoke 분리 전략) | 46차수 CI/CD 분기 정책 강화 |
| 46 | 완료(요건 검증+강화 산출) | 1차 토큰 순차 읽기 완료 | CI/CD 단계별 파이프라인 고정(스프링만 변경, nextjs만 변경, 둘 다 변경 전용 실행 단계). | `.github/workflows/docker-image.yml`(detect_changes/needs backend/web/race 분기) + `docs/product/backlog/spring-next-backend-step46-cicd-deploy-split.md`(분기 설계) | 47차수 스테이징 다중 배포 시나리오 |
| 47 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 스테이징 환경에서 스프링 단독 배포/Next 단독 배포/동시 배포 시나리오를 각각 1회 이상 실행. | `docs/product/backlog/spring-next-backend-step47-staging-tri-deploy-runbook.md`(스테이징 3종 배포 계획) | 47차수 실행 전환 대비 |
| 48 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 장애 감지 규칙 설정(500 급증, p95 지연, DB 커넥션 에러) 및 알림 채널 연동. | `docs/product/backlog/spring-next-backend-step48-incident-alarm-threshold.md`(알림 임계치 설계) | 48차수 실행 전환 대비 |
| 49 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 배포 모니터링과 운영 이슈 대응용 랜북(runbook) 초안 작성(로그 탐색 키워드, 재시작 순서, 임시 셧다운). | `docs/product/backlog/spring-next-backend-step49-runbook.md`(런북 초안) | 49차수 실행 전환 대비 |
| 50 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 운영 전환 이전, canary 10%/30%/100% 단계 실행 체크리스트 확정. | `docs/product/backlog/spring-next-backend-step50-canary-checklist.md`(canary 단계표) | 50차수 실행 전환 대비 |
| 51 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 사용자 동선별 회귀 시나리오(상담기록 생성/조회, 카드 덱 편집/저장, 타이핑 레이스 시작/완료) 수행. | `docs/product/backlog/spring-next-backend-step51-user-flow-regression.md`(사용자 동선) | 51차수 실행 전환 대비 |
| 52 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 이벤트 추적/분석 쿼터(analytics)가 스프링 호출 경로로 바뀌어도 이탈이 없는지 검증. | `docs/product/backlog/spring-next-backend-step52-analytics-path-check.md`(이벤트 경로 점검) | 52차수 실행 전환 대비 |
| 53 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 보안 점검(권한 우회, 민감데이터 노출, CORS/CSP) 및 정적 분석 도구 실행. | `docs/product/backlog/spring-next-backend-step53-security-hardening.md`(보안 점검) | 53차수 실행 전환 대비 |
| 54 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 감사 로그·접근 로그 수집 기간 및 보관 규칙을 운영 정책과 동기화. | `docs/product/backlog/spring-next-backend-step54-log-retention.md`(로그 보존 정합성) | 54차수 실행 전환 대비 |
| 55 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | Next legacy 라우트 임시 스텁 정리 계획 수립(필요 없는 포워드 라우트 삭제). | `docs/product/backlog/spring-next-backend-step55-legacy-stub-cleanup.md`(legacy 라우트 정리) | 55차수 실행 전환 대비 |
| 56 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 배포 파이프라인 문서와 실제 CI 동작 간 불일치 제거(환경 변수 명칭/시크릿 경로 정합). | `docs/product/backlog/spring-next-backend-step56-ci-cd-doc-sync.md`(문서-파이프라인 정합) | 56차수 실행 전환 대비 |
| 57 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 불필요한 브레이크포인트/임시 플래그 제거와 코드 주석 정리(Next와 Spring 중복 경로 참조). | `docs/product/backlog/spring-next-backend-step57-debt-cleanup.md`(임시 플래그 정리) | 57차수 실행 전환 대비 |
| 58 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 마이그레이션 리포트 공개 양식 정리(도메인별 이관률, 실패 원인, 회귀 건수, 운영 지표). | `docs/product/backlog/spring-next-backend-step58-migration-report-template.md`(리포트 템플릿) | 58차수 실행 전환 대비 |
| 59 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | `develop` 브랜치 회피 정책 및 `main` 전환 규칙 재확인 후 팀 공유. | `docs/product/backlog/spring-next-backend-step59-branch-policy-alignment.md`(브랜치 규칙 정렬) | 59차수 실행 전환 대비 |
| 60 | 완료(차수 상세 산출) | 1차 토큰 순차 읽기 완료 | 최종 마일스톤 후 회고 문서 작성 및 다음 2차 백로그(성능/운영 고도화) 설계. | `docs/product/backlog/spring-next-backend-step60-retrospective-and-next-wave.md`(회고 설계) | 60차수 실행 전환 대비 |
