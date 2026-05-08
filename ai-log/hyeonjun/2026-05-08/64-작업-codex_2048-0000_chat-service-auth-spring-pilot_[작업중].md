# 64차 작업 — chat-service-auth spring pilot

- 시작: 20:48
- 목표: `/api/v1/chat-service/auth*` Spring cutover
- 범위: cookie set/clear와 token 추출은 Next 유지, otp/session 비즈니스만 Spring 이동

## 중간 체크포인트
- 사용자 요청으로 AI 토큰 부족 상태에서 여기서 중단.
- 이번 차수 목표:
  - `/api/v1/chat-service/auth/request-otp`
  - `/api/v1/chat-service/auth/session`
  - `/api/v1/chat-service/auth/verify-otp`
  Spring cutover

### 현재까지 반영한 파일
- backend 생성
  - `apps/backend/src/main/java/world/yeon/backend/chat_service_auth/**`
  - `apps/backend/src/test/java/world/yeon/backend/chat_service_auth/controller/ChatServiceAuthControllerTests.java`
- docs/log 생성
  - `docs/product/backlog/spring-chat-service-auth-pilot.md`
  - `docs/architecture/spring-chat-service-auth-pilot.md`
  - 현재 작업중 로그 파일

### 아직 안 끝난 것
- web thin BFF 교체 미완료
  - `apps/web/src/server/chat-service-auth-spring-client.ts` 아직 미생성
  - auth 3개 route cutover 아직 미반영
  - route test 아직 미작성
- 전체 검증 미실행
  - gradle test
  - vitest
  - typecheck
  - build
  - diff/ssot gate

### 다음 턴 첫 작업 순서
1. `apps/web/src/server/chat-service-auth-spring-client.ts` 생성
2. 아래 route 3개를 Spring client 호출로 교체
   - `apps/web/src/app/api/v1/chat-service/auth/request-otp/route.ts`
   - `apps/web/src/app/api/v1/chat-service/auth/session/route.ts`
   - `apps/web/src/app/api/v1/chat-service/auth/verify-otp/route.ts`
3. route test 3개 추가
4. 검증:
   - `./gradlew test --tests 'world.yeon.backend.chat_service_auth.*'`
   - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/chat-service/auth/request-otp/__tests__/route.test.ts' 'src/app/api/v1/chat-service/auth/session/__tests__/route.test.ts' 'src/app/api/v1/chat-service/auth/verify-otp/__tests__/route.test.ts'`
   - `pnpm --filter @yeon/web typecheck`
   - `pnpm --filter @yeon/web build`
   - `git diff --check`
   - `bash bin/sync-skills.sh --check`
   - `bash bin/verify-ssot.sh --project-only`

### 메모
- cookie set/clear와 bearer/cookie token 추출은 Next 유지 계획.
- Spring auth endpoint 헤더는 `X-Yeon-Chat-Session-Token`으로 설계해둠.
- goal은 여전히 미완료.
