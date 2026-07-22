# YEON Today 전등 헤더 겹침 재보정

- 작업자: codex
- 상태: 완료
- 시작: 2026-07-22 21:12 KST
- 종료: 2026-07-22 21:14 KST
- 대상: `/` 랜딩 5번 YEON Today 카드
- 백로그: `docs/product/backlog/2026-07-22-landing-frame-break-service-card-20.md`

## 원인

- 전경을 16px 내린 뒤에도 전등 소켓 상단이 5번 번호 레이어 하단과 겹쳐 번호 뒤에서 잘린 것처럼 보인다.

## 수정 방향

- 전경을 추가로 16px 내려 번호 아래에 실제 안전 여백을 만든다.
- 이미지 에셋, z-index, 다른 카드 위치는 변경하지 않는다.

## 변경 결과

- 5번 `bottomClassName`: `-bottom-8` → `-bottom-12`
- 전등 소켓 상단과 번호 하단 사이의 흰 안전 여백을 실제 화면에서 확인했다.

## 시각 증거

- `today-lamp-final-screenshots/after-375.png`
- `today-lamp-final-screenshots/after-1440.png`

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- Playwright 375px·1440px: 가로 overflow 0 확인
