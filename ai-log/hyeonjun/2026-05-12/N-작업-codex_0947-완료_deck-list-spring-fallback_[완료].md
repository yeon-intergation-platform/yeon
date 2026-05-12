# deck-list-spring-fallback

- 시작: 2026-05-12 09:47 KST
- 요청: 타이핑 서비스 내 덱/공개 덱 목록 오류와 카드 서비스 내 덱 목록 오류를 각각 수정한다.
- 원인 후보: Spring backend가 기본 profile로 떠서 `@Profile("jdbc")` 컨트롤러가 비활성화되고, Next BFF 목록 API가 Spring 401을 그대로 화면 오류로 전달한다.
- 계획: 목록 API에 기존 Next DB 서비스 폴백을 추가하고, 로컬 curl과 web 검증으로 확인한다.

- 09:55 KST: 사용자 방향에 따라 backend profile을 dev.local/staging/prod로 재정리한다.
