# GA4 클릭 이벤트 집계 검증

## 배경

공개 콘텐츠/서비스 CTA 클릭을 GA4에서 이벤트별 횟수와 클릭률로 볼 수 있어야 한다. GA4 맞춤 정의는 일부 생성됐으므로, 코드가 의도한 이벤트와 매개변수를 보내는지 실제 브라우저 클릭으로 확인하고 부족한 부분을 보강한다.

## 1차

### 작업내용

- 웹 앱의 GA4 설정, `gtag` 삽입, 이벤트 전송 helper를 확인한다.
- 공개 콘텐츠/서비스 CTA 클릭 이벤트가 `public_content_cta_click`과 필요한 매개변수를 보내는지 점검한다.
- Playwright로 실제 사이트를 클릭해 이벤트 호출을 검증한다.
- 누락된 클릭 추적 지점이 있으면 최소 범위로 보강한다.
- GA4 UI에서 확인해야 할 이벤트/맞춤 정의 이름을 정리한다.

### 논의 필요

- GA4 Admin 화면의 실제 보고서 구성은 브라우저 계정 권한과 GA4 지연 수집 특성 때문에 코드/네트워크 검증과 분리해 본다.
- 클릭률 계산은 GA4 Explore 또는 BigQuery/Looker Studio 계산 지표로 볼지 운영 방식 결정이 필요하다.

### 선택지

- 코드/네트워크 검증 중심: 이벤트 전송 구조와 실제 `gtag` 호출을 확인한다.
- GA4 UI 실시간 확인까지 포함: DebugView/Realtime에서 이벤트 노출까지 기다린다.

### 추천

먼저 코드/네트워크 검증을 완료한다. GA4 UI 반영은 지연과 권한 영향을 받으므로, 브라우저 클릭 시 `gtag event` 호출과 매개변수가 정확한지를 1차 완료 기준으로 둔다.

### 사용자 방향

중단됐던 애널리틱스 작업을 이어서 진행한다. `cheat pro` 연결은 repo-harness MCP 상태 확인에 사용하고, 실제 구현/검증은 Codex가 수행한다.

### 완료 결과

- `public_content_cta_click` 이벤트가 article CTA 클릭에서 GA4 파라미터를 보내는지 Playwright 회귀 테스트로 고정했다.
- `public_content_link_click` 이벤트가 support 빠른 해결 링크 클릭에서 GA4 파라미터를 보내는지 Playwright 회귀 테스트로 고정했다.
- 포트 충돌 시에도 공개 콘텐츠 e2e를 검증할 수 있도록 `PLAYWRIGHT_BASE_URL` 설정을 지원했다.
- 실제 브라우저 클릭 검증에서 두 이벤트의 `channel`, `service`, `category`, `slug`, `link_kind`, `target_title`, `target_url` payload를 확인했다.
