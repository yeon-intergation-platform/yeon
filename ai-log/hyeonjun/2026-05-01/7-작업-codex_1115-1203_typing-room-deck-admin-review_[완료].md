# 타자방 덱 관리자 권한/관리 UI 구현

- 시작: 2026-05-01 11:15 KST
- 종료: 2026-05-01 12:03 KST
- 상태: 완료
- 요청: DB role + 최초 관리자 이메일 시드 기반 admin 접근, 보호된 타자 덱/지문 관리자 UI 구현.
- 범위: users.role 스키마/마이그레이션, 서버 admin helper, `/admin/typing-decks`, typing-decks API admin 모드, 클라이언트 admin 모드 hook/UI, auth/admin 테스트.
- 검증: `pnpm --filter @yeon/web lint`, targeted vitest 3 files/12 tests, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web db:check:drift`, `pnpm --filter @yeon/web build` PASS.
- 비고: 타자방 로비 UI/레이스 서버는 본 커밋 범위에서 제외. 기존 다른 작업자의 미완료 변경은 별도 unstaged/stash로 보존.
