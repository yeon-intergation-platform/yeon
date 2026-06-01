# 비로그인 공통 헤더 프로필 메뉴 숨김 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 비로그인 상태에서 내정보보기/로그아웃 드롭다운과 이를 여는 프로필 버튼이 보이지 않도록 한다.
- 범위: apps/web 공통 제품 헤더, docs/product/backlog, ai-log
- 원칙: `/api/v1/auth/session` 응답의 authenticated 값을 source of truth로 사용한다.

## 변경

- 공통 제품 헤더의 기본 프로필 버튼이 세션 상태를 확인하도록 했다.
- 세션 확인 전/비로그인/세션 조회 실패 상태에서는 프로필 버튼과 드롭다운을 렌더링하지 않는다.
- authenticated가 true일 때만 내정보보기/로그아웃 메뉴를 노출한다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- Playwright: 비로그인 `/typing-service`에서 `내정보 메뉴` 버튼 0개, `내정보보기` 0개, `로그아웃` 0개 확인
