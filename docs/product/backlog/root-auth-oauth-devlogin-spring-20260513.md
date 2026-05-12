# Root auth OAuth/dev-login Spring 이관 백로그

## 1차

### 작업내용

- Google/Kakao OAuth callback의 사용자 upsert와 세션 생성을 Spring `root_auth`로 이관한다.
- dev-login의 테스트 사용자 조회/생성/세션 생성을 Spring으로 이관한다.
- Next `server/auth/session.ts`의 세션 조회/삭제 DB 접근을 Spring 세션 API 호출로 대체한다.
- Next `server/auth/admin.ts`의 관리자 role 조회/seed promotion DB 접근을 Spring으로 대체한다.
- Next route/page는 OAuth state cookie, redirect, auth cookie 적용, Spring 호출 bridge만 유지한다.

### 논의 필요

- OAuth provider authorization URL 생성과 state cookie는 브라우저 리다이렉트/쿠키 bridge이므로 이번 차수에서는 Next에 남긴다.
- Provider token exchange/profile fetch는 callback 완료의 인증 처리이므로 Spring으로 옮긴다.

### 선택지

1. OAuth provider exchange까지 Spring으로 옮기고 Next는 code/codeVerifier/origin만 전달한다.
2. Next가 provider profile을 fetch하고 Spring에는 profile upsert만 맡긴다.
3. dev-login/admin/session은 별도 차수로 분리한다.

### 추천

- 1번을 기본으로 하고, dev-login/admin/session helper까지 같은 PR에서 처리한다. 그래야 Next 인증 DB 쓰기/조회 소유권이 남지 않는다.

### 사용자 방향

- 추천 기준으로 진행한다.
