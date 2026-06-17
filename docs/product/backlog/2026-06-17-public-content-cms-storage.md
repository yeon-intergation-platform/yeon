# 공개 콘텐츠 CMS 저장소 전환 준비

작성일: 2026-06-17
범위: Spring 공개 콘텐츠 저장소, Flyway schema, JDBC read store
제외: admin 본문 편집 UI, 삭제 UI, 상담 워크스페이스

## 1차: seed 기본값을 유지한 DB 저장소 준비

논의 필요: 지금 바로 공개 읽기 API를 DB 기반으로 바꿀지, DB 저장소를 옵션으로 추가할지.
선택지: 즉시 DB 전환, seed 기본값 유지 + DB 옵션, seed만 유지.
추천: seed 기본값을 유지하고 `PUBLIC_CONTENT_STORE=jdbc`에서만 DB store를 사용하게 한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 공개 콘텐츠 article 테이블을 Flyway migration으로 추가한다.
2. public read에 필요한 published/public/noindex 조건을 DB index로 보조한다.
3. channel과 slug는 unique source of truth로 둔다.
4. status, visibility, channel, serviceKey, category 값은 check constraint로 고정한다.
5. admin 추적용 sourceRepo/sourcePaths/redirectTo 필드를 포함한다.
6. Java store interface를 추가해 service가 seed 구현에 직접 묶이지 않게 한다.
7. 기존 seed repository는 기본 store로 유지한다.
8. JDBC repository는 `PUBLIC_CONTENT_STORE=jdbc` 옵션에서만 bean으로 켠다.
9. JDBC repository는 published/public/noindex=false 글만 공개 API에 노출한다.
10. 기존 public read API 응답 형태는 변경하지 않는다.
11. repository 선택과 SQL 공개 필터를 테스트로 고정한다.
12. Spring context smoke는 기본 seed store에서 계속 통과해야 한다.
