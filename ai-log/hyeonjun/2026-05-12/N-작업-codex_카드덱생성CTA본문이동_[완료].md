# 카드 덱 생성 CTA 본문 이동 작업 로그

## 목표

- `YEON 카드` 헤더의 `+ 새 덱` 버튼을 제거한다.
- 덱 목록 본문 내부에서 덱 생성이 가능하도록 CTA를 배치한다.

## 검증 계획

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`

## 완료 기록

- `YEON 카드` 헤더에서 `+ 새 덱` 버튼을 제거했다.
- 덱 목록 섹션 제목/설명 오른쪽에 본문 CTA로 `+ 새 덱` 버튼을 배치했다.
- 검증: `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`, `git diff --check`.
