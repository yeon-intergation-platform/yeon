# R2 MP3 에셋 분리 백로그

## 1차

### 작업내용

- 상담 테스트/샘플 음성 mp3와 타자방 BGM mp3의 웹 앱 참조를 R2 공개 URL로 전환한다.
- 웹 Dockerfile이 `voice-test-data` mp3를 빌드 이미지에 복사하지 않도록 제거한다.
- Docker context에 대용량 mp3/로컬 작업 산출물이 섞이지 않도록 `.dockerignore`를 보강한다.

### 논의 필요

- R2 객체의 장기 캐시 정책은 Cloudflare 대시보드/업로드 메타데이터에서 최종 관리한다.
- BGM 파일명은 사용자가 지정한 `찹츄찹찹츄.mp3` R2 URL을 사용한다.

### 선택지

1. 기존 `/test-data`, `/audio` public 파일을 유지하면서 R2 URL만 병행한다.
2. 프로덕션 런타임 참조를 R2 URL로 완전히 전환하고 Docker 복사를 제거한다.
3. R2 프록시 route를 추가한다.

### 추천

- 2번. 공개 샘플/음원은 R2가 source of truth가 되게 하고, Next.js/Docker 이미지는 코드와 필수 정적 자산만 포함한다.

### 사용자 방향

- 추천 기준으로 진행한다. BGM은 `https://assets.yeon.world/audio/%EC%B0%B9%EC%B8%84%EC%B0%B9%EC%B0%B9%EC%B8%84.mp3`를 사용한다.
