# 타자방 로비 재시도 문구 안정화 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 타자방 서버 연결 실패 후 재시도 중에도 로비 목록 상태 문구가 흔들리지 않게 한다.
- 범위: typing-room-lobby-screen, use-typing-room-lobby, AGENTS.md, backlog, ai-log
- 원칙: 무한 재시도는 유지하고 표시 문구만 안정화한다.

## 변경

- 타자방 로비 훅이 연결 실패 이력을 기억해 재시도 중에도 실패 문구를 유지하도록 수정했다.
- 로컬 타자 서비스 검증 시 race-server를 함께 실행·재사용해야 한다는 규칙을 AGENTS.md에 추가했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- Playwright 정상 경로: race-server 실행 상태에서 타자방 목록이 빈 상태로 표시됨
- Playwright 실패 경로: race-server 목록 API를 차단한 뒤 실패 문구가 5초 동안 고정됨
