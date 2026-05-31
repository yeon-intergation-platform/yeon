# 타자 점령전 서브도메인 채팅 숨김 보정 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: `typing.yeon.world/territory`에서 공용 floating chat이 점령전 HUD를 덮지 않게 한다.
- 원인: 서브도메인 접근 시 브라우저 pathname이 `/territory`라 기존 `/typing-service/territory` 숨김 조건과 맞지 않았다.
- 변경: fullscreen typing route set에 `/territory`를 추가했다.
- 검증 예정: web lint/typecheck/build, Playwright local/prod smoke.
