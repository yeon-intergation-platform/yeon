# chat-service guest profile Spring cutover

## 1차

### 작업내용

- feed 작성/수정/삭제 route에서 비로그인 닉네임/비밀번호 profile 생성·조회 소유권을 Spring으로 이관한다.
- Spring auth 영역에 guest profile resolve endpoint를 추가한다.
- 기존 guest profile phone key(`guest:` + sha256(nickname + NUL + password) 앞 14자리)와 익명 기본 프로필 값을 유지한다.
- Next route는 게스트 입력 검증 후 Spring client로 profile id를 받아 feed Spring API에 전달한다.

### 논의 필요

- guest profile resolve endpoint를 공개 API로 둘지 내부 API로 유지할지 장기 정책 결정이 필요하다.

### 선택지

1. 내부 Spring endpoint로 추가해 Next BFF에서만 호출한다.
2. public contract에 노출하고 클라이언트가 직접 호출하게 한다.

### 추천

- 1번. 현재 제품 흐름을 유지하면서 Next DB 소유권만 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.
