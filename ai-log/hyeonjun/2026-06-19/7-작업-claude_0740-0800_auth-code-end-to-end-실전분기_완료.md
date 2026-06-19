# auth(credential) code end-to-end + 실전 분기 (에러 감사 후속 2단계-b)

## 배경

auth는 code 인프라가 거의 완비돼 있었다: `authErrorCodes` 상수, `AuthFlowError(code, message)`, **code별 한국어 안내 카피 `getAuthErrorCopy(code)`**, credential-auth-spring-client가 백엔드 code를 `AuthFlowError.code`로 파싱. 빠진 고리는 ① BFF가 직렬화에서 code 누락 ② 클라가 code를 안 씀.

## 변경 (2곳, 빠진 고리만)

- `server/auth/credentials/route-helpers.ts`: `respondWithAuthError`가 `{ code: error.code, message }`로 직렬화(기존 message만). `respondWithServerError`도 `server_error` code.
- `lib/credential-client.ts`: `getCredentialErrorMessage`가 `error.code`로 `getAuthErrorCopy(code).description`를 우선 사용(이미 완비된 code별 카피 활용). code 없으면 message 폴백.

## 효과

- 백엔드 → AuthFlowError.code → respondWithAuthError(code) → CredentialApiError.code(2-a) → getCredentialErrorMessage(code) → **code별 정확한 안내가 5개 credential 폼 전부에 자동 적용**(login/register/reset-request/reset-password/resend-verification). 첫 "실전 code 소비" 사례.

## 검증

- 신규 `credential-client.test.ts` 5/5(code→카피, account_locked 매핑, code 없음/미정의 폴백, 비-에러 fallback).
- typecheck/lint exit 0(모바일 포함, client가 순수 auth-errors import 경계 OK).

## 남은 후속

- 2단계-c: realtime — race-server 문자열 code + use-race-room message.includes→code.
- 3단계: 백엔드 전역 핸들러 + 공통 ErrorResponse + ErrorCode enum.
