# 2-작업-codex_1636-1641_analytics-core-events_[완료]

- 시작: 2026-05-06 16:36 KST
- 종료: 2026-05-06 16:41 KST
- 작업자: codex
- 범위: `apps/web/src/lib/analytics.ts`, 로그인/타자/방/덱 진입 관련 웹 클라이언트 파일, `docs/product/backlog/seo.md`
- 목표: 핵심 퍼널 이벤트(`login`, `typing start`, `room create`, `deck open`)를 GA4로 수집한다.
- 결과:
  - 공통 `trackEvent` 유틸을 추가했다.
  - 랜딩 소셜 로그인 클릭에 `login_click`을 연결했다.
  - 이메일 로그인 성공에 `login_success`를 연결했다.
  - 솔로/연습 첫 입력 시점에 `typing_start`를 연결했다.
  - 타자방 생성 의도/성공에 `room_create_intent`, `room_create_success`를 연결했다.
  - 덱 상세 진입에 `deck_open`을 연결했다.
- 검증:
  - `pnpm --filter @yeon/web build` 통과
- 메모: 빌드 중 생성된 `registry.generated.ts` 변경은 범위 밖이라 원복했다.
