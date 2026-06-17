# 공개 콘텐츠 API 계약

## 목적

500단계 계획 5차의 API 계약과 클라이언트 경계를 시작한다. 정적 registry로 만든 공개 콘텐츠를 이후 Spring CMS와 연결할 수 있도록 `@yeon/api-contract`와 `@yeon/api-client`에 공개 콘텐츠 DTO, request, response SSOT를 만든다.

## 1차: contract와 typed client

논의 필요: 공개 콘텐츠 API를 지금 바로 backend 구현까지 연결할지, 먼저 계약을 고정할지.  
선택지: contract 먼저, backend까지 한 번에, web static registry 유지.  
추천: contract와 typed client를 먼저 고정하고, Spring controller/repository는 다음 배치에서 구현한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `packages/api-contract`에 `public-content` export를 추가한다.
2. channel, service, category, status, visibility literal contract를 추가한다.
3. 공개 article summary/detail DTO를 추가한다.
4. public list/detail/sitemap response schema를 추가한다.
5. admin draft/create/update/publish/archive request schema를 추가한다.
6. `packages/api-client`에 공개 콘텐츠 list/detail/sitemap 조회 메서드를 추가한다.
7. `packages/api-client`에 admin 콘텐츠 생성/수정/발행/archive 메서드를 추가한다.
8. contract 패키지와 소비자 typecheck를 통과시킨다.
9. backend route 구현은 별도 후속 작업으로 둔다.

진행 결과: 완료. 공개 콘텐츠 계약은 `support`, `news`, `blog` 채널 분리 정책을 기준으로 고정했고, backend route 구현은 다음 배치에서 진행한다.
