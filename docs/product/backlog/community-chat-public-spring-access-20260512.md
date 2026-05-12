# Community Chat Public Spring Access — 2026-05-12

## 배경
카드서비스/타자서비스/커뮤니티의 실시간 채팅은 누구나 읽고 쓸 수 있어야 한다. 현재 Spring `CommunityChatController`는 `X-Yeon-User-Id`를 optional로 받지만, 전역 Spring Security가 `/api/v1/community-chat/messages`를 인증 대상으로 처리해 내부 토큰 누락/오류 시 공개 채팅이 401로 막힐 수 있다.

## 1차수 — Spring 공개 채팅 보안 경계 복구

### 작업내용
- Spring Security에서 `/api/v1/community-chat/messages` GET/POST를 인증 없이 허용한다.
- 컨트롤러/서비스의 게스트 전송 흐름은 유지한다.
- 기존 internal-token 보호가 필요한 다른 Spring API에는 영향을 주지 않는다.
- 관련 Spring 보안 테스트를 추가/보강한다.

### 논의 필요
- 공개 채팅 API를 Spring 레벨에서도 완전 공개로 둘지, Next BFF 내부 토큰만 필수로 둘지 결정이 필요하다.

### 선택지
1. `/api/v1/community-chat/messages`만 Spring Security `permitAll` 처리한다.
2. BFF 내부 토큰은 유지하고 웹 env 설정만 보강한다.
3. 별도 public API security chain을 추가한다.

### 추천
- 1번. 요구사항이 “누구나 사용 가능”이고 컨트롤러가 이미 optional user 구조이므로, 이 엔드포인트는 Spring 보안에서도 공개 API로 명시하는 것이 가장 단순하고 재발 가능성이 낮다.

### 사용자 방향
- 추천 기준으로 진행한다.

## 검증 계획
- `apps/backend` 테스트 중 Security/CommunityChat 관련 테스트 실행
- `pnpm --filter @yeon/web test -- ...community-chat...` 가능 시 실행
- `git diff --check`
- `bash bin/verify-ssot.sh --project-only`
