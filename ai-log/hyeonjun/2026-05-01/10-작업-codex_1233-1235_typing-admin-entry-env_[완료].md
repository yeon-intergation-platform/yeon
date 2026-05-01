# 타자 덱 관리자 진입 경로 및 운영 env 전달

- 시작: 2026-05-01 12:33 KST
- 실제 종료: 2026-05-01 1235 KST
- 상태: 완료

## 요청

로그인 후 `/admin/typing-decks`를 직접 URL로 입력하지 않아도 관리자 권한 사용자가 관리자 덱 화면으로 들어갈 수 있어야 한다.

## 작업

- 일반 타자 덱 화면에서 서버 사이드 관리자 판정 후 관리자 버튼 노출
- 운영 compose에서 `YEON_ADMIN_EMAILS`를 web 컨테이너로 전달
- 검증 후 main PR/merge/deploy 확인 예정

## 검증

- `pnpm --filter @yeon/web typecheck` PASS
- `pnpm --filter @yeon/web lint` PASS
- `pnpm --filter @yeon/web build` PASS
- `git diff --check` PASS
