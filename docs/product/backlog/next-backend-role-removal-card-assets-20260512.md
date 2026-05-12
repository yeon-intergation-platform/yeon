# Next 백엔드 역할 제거 — 카드 이미지 assets Spring 전환

## 배경

전체 목표는 `apps/web`의 백엔드/DB 역할을 0%로 줄이고 Spring을 유일한 backend source of truth로 만드는 것이다. 현재 `apps/web/src/app/api/v1` route 중 카드 이미지 asset 2개가 `@/server/services/card-deck-image-storage`를 직접 호출해 R2/S3 업로드·다운로드 정책을 Next가 소유하고 있다.

## 1차 — 카드 이미지 assets Spring 소유화

### 작업내용

- Spring `apps/backend`에 카드 이미지 업로드/다운로드 controller/service/storage를 추가한다.
- R2/S3 object key 생성, MIME/크기 검증, 다운로드 헤더 정책을 Spring service가 소유한다.
- Next `card-decks/assets` route는 multipart/file parse와 Spring 호출 bridge만 수행한다.
- `apps/web/src/app/api/v1/card-decks/assets/**/route.ts`에서 `@/server/services/card-deck-image-storage` import를 제거한다.

### 논의 필요

- 기존 공개 업로드 정책은 유지할지, 사용자 인증을 요구할지.

### 선택지

1. 기존 동작 유지: Next route처럼 인증 없이 내부 token으로 Spring에 위임한다.
2. 즉시 인증 요구: upload/download에 `X-Yeon-User-Id`를 요구한다.

### 추천

- 1번. 이번 PR은 backend ownership 전환이 목표이므로 사용자 가시 동작을 바꾸지 않는다. 접근 정책 강화는 별도 차수에서 수행한다.

### 사용자 방향

## 2차 — 잔여 counseling/local route 전환

### 작업내용

- counseling-records와 integrations/local route의 DB/service 호출을 Spring API로 옮긴다.

### 논의 필요

- AI/STT orchestration을 Spring에서 완전히 수행하기 위한 외부 AI client 경계.

### 선택지

1. 기능별 작은 PR로 route를 줄인다.
2. counseling 전체를 한 번에 옮긴다.

### 추천

- 1번. 실패 범위와 검증 시간을 줄인다.

### 사용자 방향
