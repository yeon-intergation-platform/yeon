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

## 2차

### 작업내용

- 1차 이후 남은 로컬 `ErrorResponse(code, message)` 생산자를 전수 스캔해 공통 `ApiErrorResponse`로 통일한다.
- Next.js BFF/API route의 `message` 단독 오류 응답을 `code` 포함 공통 계약으로 맞춘다.
- `main` 배포 실패 #895의 원인인 web Docker build 단계 취소를 재현 로그 기준으로 정리하고 재발 방지한다.
- 변경 후 계약 스캔, 타입체크, 백엔드 테스트로 검증한다.

### 논의 필요

- 동결 서비스 컨트롤러까지 건드리는 것이 원칙상 예외인지 확인이 필요하지만, 사용자가 "모두 찾아서 고쳐서 머지"를 명시했으므로 이번 작업 범위에 포함한다.
- Docker 이미지 빌드 안의 Next TypeScript 검사를 유지할지, 이미 강제되는 `frontend-quality` 타입체크를 SSOT로 두고 이미지 빌드에서는 중복 검사를 건너뛸지 선택이 필요하다.

### 선택지

- A. 공통 helper를 추가하고 모든 로컬 컨트롤러를 기계적으로 공통 오류 DTO로 바꾼다.
- B. 유지보수 대상만 유지하고 동결 서비스는 남긴다.
- C. Docker 빌드는 그대로 두고 GitHub Actions 재시도만 한다.

### 추천

A를 추천한다. 구형 오류 생산자를 남기면 계약이 다시 갈라지고, #895는 재시도로 운 좋게 통과해도 같은 self-hosted Docker build 침묵 취소가 반복될 수 있다.

### 사용자 방향

추천 기준으로 진행한다.

## 3차

### 작업내용

- 2차 병합 후 잔여 스캔에서 발견된 local import SSE error event의 추적 메타데이터 누락을 보완한다.
- SSE event는 기존 `type: "error"` 구분자를 유지하되, 공통 오류 응답과 같은 `code`, `message`, `requestId`, 선택 메타데이터를 싣는다.
- backend controller 테스트로 SSE error event의 `requestId` 보존을 검증한다.

### 논의 필요

- SSE error event를 REST 공통 오류 body와 완전히 같은 shape로 바꿀지, 기존 스트림 소비자가 의존하는 `type` 필드를 유지하며 공통 오류 필드를 확장할지 결정해야 한다.

### 선택지

- A. `type` 필드는 유지하고 공통 오류 필드를 추가한다.
- B. SSE error event도 REST `ApiErrorResponse` body와 완전히 동일하게 만든다.
- C. SSE는 별도 프로토콜로 보고 추가 수정하지 않는다.

### 추천

A를 추천한다. 기존 클라이언트의 `event.type === "error"` 분기는 깨지지 않으면서, requestId 추적 계약을 스트림 오류에도 적용할 수 있다.

### 사용자 방향

추천 기준으로 진행한다.
