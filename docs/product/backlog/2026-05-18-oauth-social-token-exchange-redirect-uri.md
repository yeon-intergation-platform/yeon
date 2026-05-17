# OAuth 소셜 로그인 토큰 교환 redirect_uri 정합성 백로그

## 배경

운영에서 Google/Kakao 소셜 로그인 콜백 이후 `구글/카카오 인증 토큰을 발급하지 못했어요` 오류가 발생한다. 공개 운영 확인 결과 `/api/auth/google`, `/api/auth/kakao` 시작 단계는 공급자 authorization URL을 만들고 있으며, `redirect_uri`는 `https://yeon.world/api/auth/{provider}/callback`으로 생성된다.

토큰 교환 단계에서도 공급자 authorization 단계와 동일한 canonical app origin을 사용해야 한다.

## 1차수

### 작업내용

- OAuth 시작 URL의 callback origin과 Spring 토큰 교환 요청의 `appOrigin`이 같은 source of truth를 쓰도록 수정한다.
- Google/Kakao 공통으로 callback URL 생성 규칙을 테스트로 고정한다.
- 내부/프록시 origin으로 callback 요청이 들어와도 토큰 교환에는 `NEXT_PUBLIC_APP_URL` 기반 canonical origin이 전달되는지 테스트한다.

### 논의 필요

- 루트 소셜 로그인 callback은 계속 Next의 `/api/auth/{provider}/callback`을 유지한다.
- 공급자 콘솔에는 Spring backend 직접 callback을 추가하지 않는다.

### 선택지

1. callback 완료 단계에서만 `getAppOrigin(request.nextUrl.origin)`을 호출한다.
2. callback URL 생성 helper를 export하여 시작/완료 단계가 같은 origin helper를 공유한다.

### 추천

2번. 토큰 교환 실패의 본질은 authorization `redirect_uri`와 token exchange `redirect_uri`의 불일치 가능성이므로, callback URL/Origin source of truth를 명시적으로 공유하는 쪽이 안전하다.

### 사용자 방향

추천 기준으로 진행한다.
