# 서비스 subdomain 전환 후 legacy path 제거 백로그

기준일: 2026-06-01

## 1차수: 포털 진입 링크를 canonical subdomain으로 변경

### 작업내용

- `yeon.world` 홈의 키보드 타자연습 카드 링크를 `https://typing.yeon.world`로 변경한다.
- `yeon.world` 홈의 플래시카드 덱 카드 링크를 `https://card.yeon.world`로 변경한다.
- `yeon.world` 홈의 커뮤니티 카드 링크를 `https://community.yeon.world`로 변경한다.
- 홈 JSON-LD 서비스 URL도 canonical subdomain을 사용한다.

### 논의 필요

- 상담 워크스페이스는 유지보수 동결 대상이고 숨김 서비스이므로 이번 변경에서 제외한다.

### 선택지

1. `href` 자체를 absolute URL로 바꾼다.
2. 내부 라우팅용 `href`와 공개 진입용 `publicHref`를 분리한다.

### 추천

- 2번. 내부 path 매칭과 인증 게이트는 유지하고 공개 진입 링크만 subdomain으로 분리한다.

### 사용자 방향

- `yeon.world` 홈에서 세 서비스 클릭 시 subdomain으로 이동한다.

## 2차수: legacy path URL을 canonical subdomain으로 redirect

### 작업내용

- `https://yeon.world/typing-service`와 하위 경로를 `https://typing.yeon.world`로 redirect한다.
- `https://yeon.world/card-service`와 하위 경로를 `https://card.yeon.world`로 redirect한다.
- `https://yeon.world/community`와 하위 경로를 `https://community.yeon.world`로 redirect한다.
- query string을 보존한다.
- subdomain에서 legacy prefix가 붙은 URL도 prefix를 제거한 canonical path로 redirect한다.

### 논의 필요

- 기존 path는 기능 내부 rewrite 대상이므로 파일/route 디렉터리는 남기되 public URL에서만 제거한다.

### 선택지

1. route 디렉터리를 실제 삭제한다.
2. route 디렉터리는 유지하고 public legacy path를 308 redirect한다.

### 추천

- 2번. Next 내부 rewrite의 target으로 route는 필요하므로 public URL만 없앤다.

### 사용자 방향

- `yeon.world/typing-service`, `yeon.world/card-service`, `yeon.world/community`는 더 이상 최종 URL로 남지 않아야 한다.

## 3차수: 테스트/문서/배포 검증

### 작업내용

- subdomain routing unit test를 legacy redirect까지 확장한다.
- domain routing 문서의 기존 path 정책을 “호환 유지”에서 “canonical redirect”로 갱신한다.
- lint/typecheck/test/build를 실행한다.
- PR to `main` 생성 후 merge한다.
- 운영 URL에서 redirect와 홈 링크를 확인한다.

### 논의 필요

- 브라우저 클릭 검증은 배포 후 curl/HTML 검사로 먼저 증명하고 필요 시 Playwright로 보강한다.

### 선택지

1. unit test만 추가한다.
2. unit test와 운영 curl 검증을 함께 수행한다.

### 추천

- 2번.

### 사용자 방향

- 배포 후 사용자는 URL만 확인하면 된다.
