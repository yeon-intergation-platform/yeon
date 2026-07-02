# 오류 응답 메타데이터 계약 확장

## 배경

현재 Yeon 공통 오류 응답은 백엔드 직렬화 기준으로 `code`, `message`만 보장한다. 클라이언트가 실패 원인 추적, 상태 전이 실패 표시, 다음 행동 안내를 하려면 `requestId`, `details`, 상태 메타데이터, `actionGuide`까지 같은 계약으로 받아야 한다.

## 1차

### 작업내용

- `@yeon/api-contract`의 `errorResponseSchema`에 `requestId`와 객체형 `actionGuide`를 반영한다.
- Spring 공통 오류 응답 DTO를 `code/message` 2필드에서 선택 메타데이터 포함 구조로 확장한다.
- 모든 REST 요청에 `X-Request-Id`를 보장하고 오류 본문에도 같은 requestId를 넣는다.
- `ApiException`이 도메인 상태 메타데이터를 보존해 전역 핸들러가 응답으로 전달할 수 있게 한다.
- 카드/타자 유지보수 대상의 로컬 `IllegalArgumentException` 핸들러도 공통 오류 타입을 사용하게 맞춘다.
- 계약/백엔드 테스트를 추가해 필드 직렬화와 하위호환을 검증한다.

### 논의 필요

- `actionGuide`를 문자열만 허용할지, `{ action, label }` 같은 객체도 허용할지 결정해야 한다.
- 기존 동결 서비스의 로컬 `ErrorResponse`까지 한 번에 교체할지 결정해야 한다.

### 선택지

- A. 공통 인프라와 유지보수 대상 서비스만 교체한다.
- B. 동결 서비스 포함 모든 로컬 `ErrorResponse`를 일괄 교체한다.
- C. 계약만 넓히고 백엔드 런타임 응답은 나중에 바꾼다.

### 추천

A를 추천한다. 사용자 영향이 있는 공통 계약과 유지보수 대상(card/typing/community)을 먼저 맞추고, 동결 서비스는 프로젝트 정책상 별도 명시가 있을 때만 손대는 편이 안전하다.

### 사용자 방향

추천 기준으로 진행한다.
