# chat-service feed mutation Spring cutover

## 1차

### 작업내용

- `/api/v1/chat-service/feed/{postId}` PATCH/DELETE를 Spring API로 이관한다.
- `/api/v1/chat-service/feed/{postId}/replies` DELETE를 Spring API로 이관한다.
- Spring service/repository에 작성자 권한 확인, 원글만 수정 가능, 삭제 시 답글 정리 규칙을 구현한다.
- Next route는 요청 검증, 게스트/세션 profile id 해석, Spring 호출, 응답 매핑만 담당하게 줄인다.

### 논의 필요

- 답글 수정은 현재 제품 정책상 제공하지 않는다.

### 선택지

1. 기존 정책 그대로 PATCH 원글 수정, DELETE 원글/답글 삭제만 Spring으로 옮긴다.
2. 답글 수정까지 신규 기능으로 추가한다.

### 추천

- 1번. 기능을 늘리지 않고 소유권만 Spring으로 이전한다.

### 사용자 방향

- 추천 기준으로 진행한다.
