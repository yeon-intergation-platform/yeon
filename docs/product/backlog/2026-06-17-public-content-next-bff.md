# 공개 콘텐츠 Next BFF 연결

작성일: 2026-06-17
범위: `apps/web` 공개 콘텐츠 조회 API, `packages/api-contract` 계약 소비
제외: 상담 워크스페이스, admin 본문 수정/삭제, DB CMS mutation

## 1차: Spring 공개 읽기 API를 Next BFF로 연결

논의 필요: 공개 콘텐츠 페이지와 클라이언트가 Spring public API를 직접 호출할지, Next API를 통과할지.
선택지: Spring 직접 호출, Next BFF 통과, 정적 registry 유지.
추천: 외부/프론트 클라이언트는 기존 `@yeon/api-client` 경로를 유지하고, Next Route Handler가 Spring public read API를 얇게 호출한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. `apps/web/src/server/public-content-spring-client.ts`를 추가한다.
2. 공개 조회 client는 `SPRING_INTERNAL_TOKEN`을 보내지 않는다.
3. 성공 응답은 `@yeon/api-contract/public-content` 스키마로 검증한다.
4. Spring 오류 응답의 `message`를 Next API 오류 응답으로 유지한다.
5. `/api/v1/content` GET route를 Spring 목록 조회로 연결한다.
6. `/api/v1/content/[channel]/[...slug]` GET route를 Spring 상세 조회로 연결한다.
7. `/api/v1/content/[channel]/sitemap` GET route를 Spring sitemap 조회로 연결한다.
8. route handler에는 요청 파싱, Spring 호출, 응답 매핑만 둔다.
9. 공개 route에는 로그인 세션 가드를 넣지 않는다.
10. channel, slug, query는 공용 계약 스키마로 fail fast 검증한다.
11. route 단위 테스트로 정상 호출과 Spring 오류 매핑을 고정한다.
12. client 단위 테스트로 공개 API가 내부 토큰을 싣지 않는지 고정한다.
13. 라우팅 추가로 인한 Next build 영향을 확인한다.
14. 기존 정적 공개 페이지 렌더링은 이번 배치에서 변경하지 않는다.
15. 추후 DB CMS mutation과 admin 편집 기능은 별도 차수로 둔다.
