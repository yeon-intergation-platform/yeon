# BFF jsonError SSOT 정리 + 카드/타자/chat 잔여 도메인 code 중계 (에러 감사 후속 1단계)

## 배경

전 계층 에러 모델 감사 결과, BFF가 카드 도메인 등에서 백엔드 code를 여전히 버렸다. 추가로 공통 `jsonError` 헬퍼가 **동결 counseling 파일에 정의되어 카드/타자/spaces 등 전 도메인이 동결 파일에 의존**하는 설계 결함을 발견(사용자 승인 하에 중립 SSOT로 정리).

## 변경

### jsonError SSOT 중립화

- `apps/web/src/server/bff-error.ts` (신규): `jsonError(message, status, detail?)` 전 도메인 SSOT(detail 지원).
- `counseling-records/_shared.ts`: jsonError 정의 → `@/server/bff-error` 재수출 1줄로 교체(동결 최소 터치, 상담 기능 무변경). 기존 모든 import 경로 무수정 호환.

### 카드/타자/chat 잔여 spring-client code 중계 (7개)

card-decks, card-rooms, card-deck-assets, card-decks-merge-guest, chat-service-auth, chat-service-report, typing-character-frames.

- 에러 클래스에 `code?` 필드 + `extractSpringErrorCode`로 백엔드 code 추출.
- 대응 route catch의 Spring 분기에서 `{ code: error.code }` 전달. ServiceError 분기·fallback 보존.

## 검증

- typecheck/lint exit 0.
- 영향 도메인 테스트(card-decks/card-rooms/chat-service/server) 30파일 97개 통과.
- 동결 변경은 counseling `_shared` 재수출 1줄만(사용자 승인). spring-error.ts 미변경.

## 사고 기록

- 작업 중 외부 세션이 `git reset origin/main`을 실행(#797 Bugsink 머지 반영)하여 executor의 미커밋 spring-client/route 변경이 1차 소실됨. reflog로 확인 후 브랜치 격리하고 재작업. #797은 에러/spring 파일과 무충돌.

## 남은 후속 (전 계층 개선 계획)

- **2단계 클라이언트 소비**: 도메인 에러 클래스(CardServiceApiError/CredentialApiError/raw Error) code 통일, realtime `_code` 활용, typing `use-race-room` message.includes→code switch, auth code 직렬화.
- **3단계 백엔드 SSOT**: 전역 @RestControllerAdvice + 공통 ErrorResponse + ErrorCode enum(75개 컨트롤러 중복 제거).
