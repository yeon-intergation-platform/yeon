# 공개 콘텐츠 admin Next BFF 연결

작성일: 2026-06-17
대상: `apps/web` 공개 콘텐츠 admin API
범위: `GET /api/v1/admin/content`, `GET /api/v1/admin/content/{articleId}` 읽기 전용 연결

## 1차: admin 읽기 전용 BFF 연결

논의 필요: admin이 공개 콘텐츠 본문 수정/삭제/발행까지 담당할지 여부.
선택지: 읽기 전용 유지, 생성/수정/삭제 추가, 별도 CMS로 분리.
추천: 현재 단계에서는 읽기 전용 유지. 글 수정/삭제/발행은 관리자 직접 접속 또는 별도 CMS 결정 뒤 추가한다.
사용자 방향: 읽기 전용 유지.

작업내용:

1. Spring public content admin read API를 Next admin API route에서 호출한다.
2. Next route는 세션 사용자만 확인하고, 최종 admin 권한 검증은 Spring에서 수행한다.
3. 인증된 사용자 id는 `X-Yeon-User-Id`로 전달한다.
4. 서버 간 호출에는 기존 `SPRING_INTERNAL_TOKEN` 헤더 정책을 재사용한다.
5. admin 목록 query는 계약 스키마로 검증한다.
6. admin 상세 `articleId`는 공백과 과도한 길이를 거절한다.
7. 공개 콘텐츠 public API는 내부 토큰을 계속 보내지 않는다.
8. mutation route, mutation client, 수정/삭제 UI는 만들지 않는다.
9. route와 Spring client 단위 테스트로 인증, query 검증, Spring 오류 매핑을 확인한다.
