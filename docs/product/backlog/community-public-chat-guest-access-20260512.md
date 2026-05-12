# 카드/타자 실시간 채팅 게스트 접근 복구

## 배경

카드서비스/타자서비스/커뮤니티에 붙은 실시간 채팅은 1:1 `chat-service`가 아니라 공개 `community-chat` 흐름이어야 한다. 인증 세션 확인 실패나 Spring/BFF 실패가 사용자에게 `chat-service` 로그인 필요 상태로 보이면 비회원 채팅 접근 정책과 충돌한다.

## 1차수

### 작업내용

- `CommunityChatWidget`/`useCommunityChat`가 `/api/v1/community-chat/messages`만 사용하고 비회원 입력을 막지 않는지 확인한다.
- Next BFF `/api/v1/community-chat/messages`에서 루트 로그인 조회 실패를 게스트로 흡수한다.
- Spring/BFF 오류가 실시간 채팅 UI에 로그인 유도 문구로 노출되지 않도록 중립 오류로 정규화한다.
- 관련 route 테스트로 비회원 GET/POST, 로그인 POST, Spring 오류 메시지 정규화를 고정한다.

### 논의 필요

- 공개 채팅에서 로그인 사용자 표시명을 사용할 때 DB 세션 조회 실패를 차단으로 볼지, 게스트 전환으로 볼지 정책 확인이 필요하다.

### 선택지

- 옵션 A: 세션 조회 실패 시 채팅 전송을 막고 로그인 재시도를 요구한다.
- 옵션 B: 세션 조회 실패 시 게스트로 전환하고 공개 채팅은 계속 허용한다.

### 추천

- 옵션 B. 공개 실시간 채팅의 source of truth는 커뮤니티 채팅 API이며 로그인은 닉네임 보강 수단일 뿐 차단 조건이 아니어야 한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 검증 계획

- `rg`로 실시간 채팅 UI 경로의 로그인 유도 문구 미노출 확인
- community-chat route vitest
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/verify-ssot.sh --project-only`
