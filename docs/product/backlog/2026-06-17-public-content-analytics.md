# 공개 콘텐츠 운영 지표 추적

## 목적

`support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 분리 구조가 검색 유입과 제품 진입에 실제로 기여하는지 GA4에서 확인할 수 있게 한다.

## 1차: page view와 CTA click 추적

논의 필요: 공개 콘텐츠 클릭 이벤트를 채널별로 별도 이벤트로 나눌지, 하나의 이벤트에 파라미터를 붙일지.  
선택지: 이벤트 분리, 파라미터 통합, 혼합.  
추천: CTA는 별도 이벤트로 두고, 일반 링크는 하나의 이벤트에 `channel`, `service`, `category`, `link_kind`를 붙인다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 기존 GA4 page view tracker가 실제 layout에 장착되어 있는지 확인한다.
2. 운영 배포에서 `page_view`가 route 이동마다 전송되게 root layout에 tracker를 연결한다.
3. 공개 콘텐츠 일반 링크 클릭 이벤트를 추가한다.
4. 공개 콘텐츠 CTA 클릭 이벤트를 추가한다.
5. 이벤트 파라미터에는 채널, 서비스, 카테고리, slug, 링크 종류, target URL을 포함한다.
6. server component인 공개 콘텐츠 화면은 유지하고, 클릭 추적만 작은 client component로 분리한다.
7. Playwright smoke에서 CTA 클릭 이벤트가 gtag로 전달되는지 확인한다.
8. 기존 공개 콘텐츠 metadata, canonical, host rewrite 검증을 유지한다.
