# 공개 콘텐츠 운영 지표 18차 백로그

## 1차

작업내용:

- Search Console URL-prefix property와 sitemap 제출 대상을 support/news/blog 운영 문서에 고정한다.
- Google Site Verification token과 Search Console credential을 repo secret이 아닌 환경/안전 경로로만 다루는 기준을 문서화한다.
- GA4 `page_view`, `public_content_cta_click`, `public_content_link_click` 확인 루틴을 admin 운영 체크리스트와 governance report에 노출한다.
- 주간 Search Console snapshot, 월간 색인 제외/404/canonical/sitemap 실패 점검, 글별 query/CTA/link 추적 절차를 운영 리포트에 고정한다.
- GitHub API/PR polling 8분 이상 간격 원칙을 공개 콘텐츠 운영 문서에 유지한다.

논의 필요:

- 실제 Google API 제출까지 이번 차수에서 실행할지, credential 준비 후 별도 차수로 분리할지 결정이 필요하다.

선택지:

- 지금 제출: Search Console 권한이 있는 credential과 verification token을 준비한 뒤 `search-console:sitemaps -- --execute`를 실행한다.
- 절차 고정 후 분리: 이번 차수는 admin/문서/리포트에 운영 기준을 고정하고, credential 준비 후 별도 실행한다.
- 수동만 유지: 코드/문서 자동화 표면은 늘리지 않고 Search Console UI에서만 처리한다.

추천:

- 절차 고정 후 분리. 현재 작업 환경에서 Google 계정 내부 등록 상태를 직접 확인할 credential이 없으므로, 이번 차수는 누락 방지용 운영 표면을 먼저 고정하고 실제 제출은 credential 준비 후 별도 작업으로 실행한다.

사용자 방향:

- 추천 기준으로 진행한다.
