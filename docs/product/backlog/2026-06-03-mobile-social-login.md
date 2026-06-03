# 모바일 소셜 로그인(구글·카카오) — 웹 OAuth 콜백 재사용

작성일: 2026-06-03
상태: 구현 중(working dir, 커밋 금지)

## 배경

웹은 이미 구글/카카오 소셜 로그인이 구현돼 있다(`/api/auth/{provider}` → Spring `completeSocialAuthInSpring`).
모바일 카드 앱은 이메일/비밀번호 로그인만 있어, 로그인 시트에 소셜 버튼이 필요하다.

## 결정: 웹 OAuth 콜백 + Spring 세션 재사용 (신규 Spring 엔드포인트·OAuth 콘솔 변경 불필요)

핵심 통찰: `completeSocialAuthInSpring`이 반환하는 `session.sessionToken`은
모바일 credential 로그인(`mobileCredentialLoginResponseSchema.sessionToken`)과 **동일 종류의 Spring 세션 토큰**이다.
따라서 모바일은 웹 OAuth 콜백을 그대로 통과시키되, 마지막에 쿠키 대신 **딥링크로 토큰을 반환**받으면 된다.

- redirect_uri = 기존 웹 콜백(`/api/auth/{provider}/callback`) → Google/Kakao 콘솔 변경 불필요
- 모바일은 `expo-web-browser`의 `openAuthSessionAsync`(ASWebAuthenticationSession)로 OAuth 진행
  → 임베디드 WebView가 아니라 시스템 인증 세션이라 Google `disallowed_useragent` 회피
- 토큰은 SecureStore(`writePrimaryAuthSessionToken`)에 저장 → 이메일 로그인과 동일 세션 경로

## 보안 가드 (보안 정책 추측 금지 — contract 확인 완료)

- OAuth state는 서명된 쿠키(`yeon.oauth.state`)에 `mobileReturnUrl` 필드 추가로 운반 — PKCE/state 검증 그대로 유지
- `mobileReturnUrl`은 scheme 화이트리스트로 검증(open-redirect 차단):
  - prod: `yeon-card-service://`, `chat-service://`만 허용
  - dev(NODE_ENV≠production): Expo Go 딥링크(`exp://`, `exp+...://`)도 허용(시뮬레이터 테스트용)
- 모바일 분기는 기존 웹 쿠키 플로우와 완전히 분리 — `mobileReturnUrl` 없으면 기존 동작 그대로(비파괴)

## 변경 파일 (auth 4곳 동시 확인)

1. 서버 인증 로직: `apps/web/src/server/auth/constants.ts`(`normalizeMobileReturnUrl`),
   `oauth-state.ts`(state에 `mobileReturnUrl`), `handlers.ts`(start/complete 모바일 분기)
2. API 라우트: 변경 없음 — 기존 `/api/auth/{provider}` + `/callback` 재사용
3. 클라이언트 폼: 모바일 `card-deck-list-screen.tsx` 로그인 시트에 소셜 버튼 + 플로우
4. 세션 refresh: 변경 없음 — 토큰은 기존 `getAuthSession`/`resolveCardServiceSession` 경로로 검증

## 계약

- 신규 api-contract/api-client 없음 — 토큰은 브라우저 딥링크로 직접 수신·저장
- 모바일 세션 토큰은 기존 `getAuthSession(token)`으로 Spring 검증(이메일 로그인과 동일)

## 후속: 첫 진입 게이트 재설계 (2026-06-03)

바텀시트 로그인은 게스트-우선 홈에서 띄워져 "비회원으로 사용하기"가 의미가 없었다(이미 게스트로 진입한 상태).
→ 로그인을 **첫 진입 풀스크린 게이트**로 승격해 비회원 선택이 실제 분기가 되도록 함.

- `onboarding-storage.ts`: 게스트 opt-in 플래그(SecureStore/localStorage/메모리 폴백). 로그인 토큰과 별개.
- `card-onboarding-gate.tsx`: 웰컴 헤더(마스코트+브랜드+태그라인) + 이메일/구글/카카오 로그인 + 비회원으로 사용하기.
- `card-deck-list-screen.tsx` 부트 분기:
  - 유효 세션 토큰 → 홈(서버 모드)
  - 토큰 없음 + 게스트 opt-in 기록 있음 → 홈(게스트)
  - 둘 다 없음(첫 실행) → 게이트
  - 게이트에서 로그인/비회원 선택 후 홈. 선택은 기억되어 다음 실행부터 게이트 생략.
  - 게스트 홈의 "로그인" 칩/동기화 배너 → 게이트 재진입. 로그아웃 → 토큰·게스트기록 비우고 게이트로.
- 기존 로그인 바텀시트 제거. 게스트-우선 즉시 사용 철학은 "비회원으로 사용하기 한 번 = 이후 바로 홈"으로 보존.

## 검증

- web: typecheck/lint/test(handlers, oauth-state, social-providers)
- mobile: typecheck/lint, iOS 시뮬레이터에서 로그인 시트 → 소셜 버튼 렌더 확인
- 실제 OAuth 왕복은 GOOGLE_CLIENT_ID/KAKAO_REST_API_KEY + localhost redirect 등록된 dev 환경 필요
