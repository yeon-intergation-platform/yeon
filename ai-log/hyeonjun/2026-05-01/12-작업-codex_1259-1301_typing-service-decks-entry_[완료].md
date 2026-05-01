# 타자 서비스 메인 연습 덱 진입점 추가

- 시작: 2026-05-01 12:59 KST
- 실제 종료: 2026-05-01 1301 KST
- 상태: 완료

## 요청

`/typing-service`에서 `/typing-service/decks`로 이동할 방법이 없다.

## 작업

- 타자 서비스 메인 CTA 영역에 `연습 덱 관리` 링크 추가
- 검증 후 main PR/merge/deploy 확인 예정

## 검증

- `pnpm --filter @yeon/web typecheck` PASS
- `pnpm --filter @yeon/web lint` PASS
- `pnpm --filter @yeon/web build` PASS
- `git diff --check` PASS
