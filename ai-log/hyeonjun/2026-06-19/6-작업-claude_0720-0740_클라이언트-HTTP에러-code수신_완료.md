# 클라이언트 HTTP 에러 클래스 code 수신 (에러 감사 후속 2단계-a)

## 배경

감사 결과 클라이언트가 code를 0% 소비. 도메인 HTTP 에러 클래스에 code 필드 자체가 없어 구조적으로 분기가 불가능했다(`CardServiceApiError`/`CredentialApiError`는 code 없음, typing은 raw `Error`).

## 변경 (code를 받을 구조 확립)

- `card-service-fetch.ts`: `CardServiceApiError`에 `code`/`detail` + `readError`가 `errorResponseSchema`로 code 파싱(401 특수·spring normalize 유지).
- `typing-service-fetch.ts`: raw `Error` → `TypingServiceApiError` 클래스 신설(status+code+detail), `errorResponseSchema` 파싱. (extends Error라 기존 `instanceof Error` 소비 호환)
- `credential-client.ts`: `CredentialApiError`에 `code`/`detail` + `errorResponseSchema` 파싱.

## 효과

- card/typing은 BFF code 중계(#796/#798)가 완료돼 **이제 백엔드→BFF→클라이언트 code가 end-to-end로 도달**. feature에서 `error.code` 분기가 가능한 상태.
- credential은 클라 수신 토대만(auth BFF code 직렬화는 2단계-b에서).

## 검증

- typecheck/lint exit 0(모바일 포함). 기존 `error.message` 소비 전부 하위호환.

## 남은 후속

- 2단계-b: auth(credential) BFF code 직렬화(route-helpers/spring-client) + 실전 분기(ACCOUNT_LOCKED 등).
- 2단계-c: realtime — race-server(Colyseus)가 의미있는 문자열 code를 보내도록 + `use-race-room` `message.includes`→code switch(race-shared/race-server 동반).
- 3단계: 백엔드 전역 핸들러 + 공통 ErrorResponse + ErrorCode enum.
- feature 레벨 실전 `error.code` 분기는 백엔드 code 목록 기반 제품 결정.
