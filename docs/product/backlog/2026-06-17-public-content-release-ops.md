# 공개 콘텐츠 배포/운영 반영 19차 백로그

## 1차

작업내용:

- 공개 콘텐츠 변경을 main에 반영하기 전 확인해야 하는 release readiness runbook을 `docs/deployment/`에 둔다.
- DB migration, API contract, web route, backend, package, docs, skills, SSOT, Universal UI parity 검증 분기 기준을 명확히 한다.
- Playwright로 support/news/blog 홈 3개와 대표 글 3개를 확인하는 기준을 문서화하고 실제 smoke를 실행한다.
- PR target은 main으로 유지하고 develop을 사용하지 않는 원칙, GitHub API 8분 polling 원칙, merge 후 main 확인 원칙을 문서화한다.
- 500단계 계획 451~475를 완료 처리한다.

논의 필요:

- 공개 콘텐츠 배포 전 Playwright 범위를 대표 URL로 유지할지, 전체 글 전수 방문으로 넓힐지 결정이 필요하다.

선택지:

- 대표 URL smoke: 홈 3개와 대표 글 3개, host rewrite/robots/sitemap/metadata/JSON-LD를 확인한다.
- 전수 방문: 모든 sitemap URL을 브라우저에서 방문한다.
- 운영 확인 중심: 배포 후 Search Console/GA4 수동 확인에 맡긴다.

추천:

- 대표 URL smoke를 유지한다. 공개 글 수가 61개 이상으로 늘어난 상태라 전수 브라우저 방문은 느려지고, URL coverage는 sitemap/audit 검사가 담당하는 편이 낫다.

사용자 방향:

- 추천 기준으로 진행한다.
