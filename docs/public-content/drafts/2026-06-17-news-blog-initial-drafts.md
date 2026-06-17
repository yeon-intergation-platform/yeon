# 2026-06-17 news/blog 초기 draft 후보

이 파일은 15차 공개 콘텐츠 작업에서 당장 발행하지 않는 후보를 남긴다.
정식 import 원고는 `docs/public-content/articles/`에 `channel-service-category-slug.md` 형식으로 둔다.

## 운영 원칙

- 이미 sitemap에 들어간 공개 URL은 유지한다.
- 새 발행은 support와 연결되는 핵심 글부터 추가한다.
- 업계 뉴스 해설은 단순 외부 기사 요약이 아니라 YEON 사용자에게 주는 의미가 분명할 때만 발행한다.
- draft 후보는 발행 전에 `docs/public-content/articles/` 원고로 승격하고 `public-content:import:dry-run`을 통과해야 한다.

## draft 후보

1. `news/news/ai/monthly-discord-ai-summary`
   - 목적: 월간 AI/Discord 운영 변화 요약
   - 발행 조건: 공식 Discord 또는 AI provider 문서 변화가 YEON 사용자 설정에 영향을 줄 때
2. `blog/engineering/public-content-admin-cms-boundary`
   - 목적: `/admin/content` 읽기 전용 운영과 향후 CMS 경계 기록
   - 발행 조건: 편집/삭제/예약 발행 설계가 확정될 때
3. `blog/devlog/search-console-first-month-review`
   - 목적: Search Console 등록 후 첫 달 노출/클릭 회고
   - 발행 조건: 실제 Search Console 데이터가 충분히 쌓일 때
4. `blog/product/nexa-provider-onboarding-lessons`
   - 목적: Provider 설치 지원 문서에서 발견한 온보딩 개선점
   - 발행 조건: 실제 설치 문의나 실패 로그가 누적될 때
5. `news/updates/account/public-url-indexing`
   - 목적: 서비스별 공개 URL 색인 운영 업데이트
   - 발행 조건: URL-prefix property 등록과 sitemap 제출이 모두 완료될 때
