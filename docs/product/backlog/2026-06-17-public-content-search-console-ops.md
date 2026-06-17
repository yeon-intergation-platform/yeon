# 공개 콘텐츠 Search Console 운영 링크

## 목적

`support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 운영자가 Search Console, sitemap, robots, GA4 확인으로 바로 이동할 수 있게 하고, 주간/월간 점검 절차를 문서화한다.

## 1차: 수동 운영 링크와 점검 절차

논의 필요: Search Console/GA4를 API로 자동 수집할지, 초기에는 수동 확인 링크와 절차로 둘지.  
선택지: API 자동 수집, 수동 링크, 혼합.  
추천: credential 준비 전까지는 수동 링크와 절차를 admin에 두고, 자동 수집은 별도 credential 작업으로 둔다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `/admin/content`에 Search Console 수동 확인 링크를 둔다.
2. 채널별 admin 화면에 sitemap, robots, Search Console 링크를 둔다.
3. GA4 공개 콘텐츠 이벤트 확인 링크와 측정 ID를 운영자가 볼 수 있게 한다.
4. Search Console 주간 snapshot 절차를 문서화한다.
5. sitemap 제출 실패, 404 증가, canonical mismatch 월간 확인 절차를 문서화한다.
6. API 자동화는 credential 준비 후 별도 작업이라는 경계를 유지한다.
7. admin은 본문 수정/삭제 CMS가 아니라 운영 관제 도구라는 정책을 유지한다.
