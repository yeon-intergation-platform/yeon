# 카드덱 Spring mutation 인증 헤더 복구 백로그

## 1차

### 작업내용

- `POST /api/v1/card-decks` 등 카드덱 Spring mutation 요청에서 BFF 인증 헤더가 유지되도록 Spring 클라이언트 헤더 병합 순서를 수정한다.
- 로그인 세션이 있는 사용자의 덱 생성 요청이 Spring에서 401로 오인되지 않도록 회귀 테스트를 추가한다.

### 논의 필요

- 없음. 현재 401은 사용자 인증 정책 문제가 아니라 Next BFF → Spring 내부 요청 헤더 유실로 확인된다.

### 선택지

1. 카드덱 Spring 클라이언트의 공통 `fetchJson`에서 기본 인증 헤더와 요청별 헤더를 명시적으로 병합한다.
2. POST 라우트에서만 별도 우회/폴백을 둔다.

### 추천

- 1안. create/update/delete/item/review/study-preference 등 모든 카드덱 mutation 경로의 같은 인증 헤더 유실을 한 번에 막는다.

### 사용자 방향

- 추천 기준으로 진행.
