# 카드방 실제화 작업 로그

- 목표: 카드방 샘플/로컬 상태 제거, Spring SSOT + race-server 실시간 + web 실제 연결 수직 구현.
- 제약: develop 사용 금지, Next.js 신규 백엔드 소유 금지, 미추적 `.agents/skills/**` 파일 미소유.
- 시작 상태: `feat/card-room-v1-screen`, 기존 카드방 UI skeleton은 샘플 fixture/query 상태 기반.

## 완료 기록

- Spring `/api/v1/card-rooms` API/Flyway 테이블 추가.
- race-server `card_room` Colyseus room 추가.
- web 카드방 목록/생성/상세를 Spring/BFF/race-server 상태로 연결하고 샘플 fixture 제거.
- 검증: api-contract typecheck/lint, race-shared typecheck/lint, race-server typecheck/lint, web typecheck/lint/build, backend test 및 compileJava, git diff --check.
