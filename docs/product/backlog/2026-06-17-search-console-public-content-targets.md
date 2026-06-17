# Search Console 공개 콘텐츠 제출 대상 갱신

## 1차

### 작업내용

- Search Console 등록 대상에 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`, `discord-ai.yeon.world`를 추가한다.
- host별 sitemap 제출 목록을 문서와 스크립트에서 같은 source of truth로 관리한다.
- 실제 API 실행은 인증 credential이 있는 환경에서만 수행하고, 기본 실행은 dry-run으로 둔다.

### 논의 필요

- `discord-ai.yeon.world`의 sitemap 생성 책임은 `discord-assitant` 저장소에 둘지, Yeon 운영 문서에서 외부 대상만 추적할지 결정해야 한다.

### 선택지

- A. Yeon 문서와 스크립트에 제출 대상만 추가하고 sitemap 파일은 각 서비스가 소유한다.
- B. Yeon 저장소에서 모든 외부 서비스 sitemap까지 생성한다.
- C. Search Console 제출을 수동 절차로만 유지한다.

### 추천

- A. Yeon은 제출 대상과 운영 절차를 관리하고, 실제 sitemap 내용은 각 서비스의 canonical host가 소유한다.

### 사용자 방향

- 비워 둔다. 추천 기준으로 진행한다.

## 2차

### 작업내용

- Google OAuth refresh token 또는 service account가 준비되면 스크립트로 `sites.add`와 `sitemaps.submit`을 실행한다.

### 논의 필요

- 계정 권한, credential 저장 위치, 실행 주체를 확정해야 한다.

### 선택지

- A. 로컬 OAuth client + refresh token
- B. 서비스 계정 + Search Console 권한 부여
- C. 수동 제출

### 추천

- 초기에는 로컬 OAuth credential을 사용하고, 반복 운영이 필요해지면 서비스 계정으로 이전한다.

### 사용자 방향

- 비워 둔다. 추천 기준으로 진행한다.
