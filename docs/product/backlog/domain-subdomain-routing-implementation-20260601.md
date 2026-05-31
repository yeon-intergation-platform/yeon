# 도메인 서브도메인 라우팅 구현 2026-06-01

## 1차 — Host 기반 rewrite 구현

### 작업내용

- `typing.yeon.world`, `card.yeon.world`, `community.yeon.world` 요청을 기존 앱 path로 rewrite한다.
- API, auth, `_next`, 정적 파일은 rewrite 대상에서 제외한다.
- helper 함수와 단위 테스트를 추가한다.

### 논의 필요

- 기존 path URL을 즉시 301 redirect할지 여부는 안정화 후 결정한다.

### 선택지

- A. 신규 subdomain만 rewrite하고 기존 path는 유지한다.
- B. 기존 path를 즉시 신규 subdomain으로 301 redirect한다.

### 추천

- A. Cloudflare와 앱 rewrite가 안정화된 뒤 redirect를 별도 차수로 처리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차 — SEO URL 기준 정리

### 작업내용

- 서비스 canonical/JSON-LD/sitemap URL을 신규 subdomain 기준으로 정리한다.
- 루트 `yeon.world`는 플랫폼 홈과 법적 문서 URL을 유지한다.

### 논의 필요

- Google Search Console subdomain property 등록과 sitemap 제출은 운영 확인 후 필요하다.

### 선택지

- A. SEO canonical도 이번에 신규 subdomain으로 전환한다.
- B. 앱 라우팅만 먼저 전환하고 SEO는 기존 `yeon.world/*`로 둔다.

### 추천

- A. 사용자에게 보이는 목표 URL과 검색 canonical을 맞춘다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차 — 운영 문서와 검증 갱신

### 작업내용

- Cloudflare public hostname 설정 완료 사실을 `docs/deployment/domain-routing.md`에 기록한다.
- lint/typecheck/test와 curl smoke로 확인한다.
- PR(main) 생성 후 merge한다.

### 논의 필요

- 최종 브라우저 확인은 사용자가 실제 계정/브라우저에서 수행한다.

### 선택지

- A. 문서에 현재 완료 상태와 남은 확인을 분리해 기록한다.
- B. 체크리스트 300개를 전부 완료 처리한다.

### 추천

- A. 실제 확인 전까지 완료/미확정을 구분한다.

### 사용자 방향

- 추천 기준으로 진행한다.
