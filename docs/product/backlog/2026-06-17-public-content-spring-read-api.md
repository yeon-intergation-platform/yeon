# 공개 콘텐츠 Spring 읽기 API

## 목적

500단계 계획 6차로 공개 콘텐츠의 Spring 읽기 API를 만든다. 현재 웹 정적 registry가 SEO 화면을 담당하고 있으므로, 이번 차수는 DB/CMS 쓰기보다 public list/detail/sitemap read surface를 Spring에 고정하는 데 집중한다.

## 1차: Spring public read API

논의 필요: 정적 registry를 즉시 DB로 이전할지, Spring read API를 먼저 고정할지.  
선택지: DB까지 구현, resource seed 기반 read API, web static 유지.  
추천: resource seed 기반 Spring read API를 먼저 만들고, DB migration/admin write는 다음 배치로 분리한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `apps/backend`에 `public_content` 도메인 패키지를 추가한다.
2. public list/detail/sitemap DTO를 Spring 응답 shape로 만든다.
3. 정적 seed repository를 resource 기반으로 둔다.
4. service에서 channel, serviceKey, category, slug 필터와 404를 처리한다.
5. controller는 `/api/v1/content`, `/api/v1/content/{channel}/{*slug}`, `/api/v1/content/{channel}/sitemap` 읽기만 담당한다.
6. public read path는 Spring Security permitAll에 추가하고 admin path는 추가하지 않는다.
7. public detail 응답에서는 로컬 `sourcePaths`를 노출하지 않는다.
8. controller/service/context 테스트를 추가한다.
9. DB/CMS write와 admin mutation API는 다음 배치로 둔다.

진행 결과: 완료. Spring read API는 resource seed 기반으로 열었고, public 응답에서 `sourcePaths`를 제거했다. 다음 배치는 Next BFF/API client 소비 연결이다.
