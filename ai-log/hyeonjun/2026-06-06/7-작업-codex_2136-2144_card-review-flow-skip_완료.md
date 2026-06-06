# 카드 복습 모드 정답 확인/스킵 작업 로그

## 목표

- 복습 모드 최초 화면은 문제만 표시한다.
- 정답 확인 후 문제, 정답, 어려움/좋음/쉬움 선택지를 표시한다.
- 진행 표기를 현재 카드 번호와 전체 카드 수로 맞추고 `|`를 제거한다.
- 스킵은 리뷰 난이도를 저장하지 않고 다음 카드로 이동한다.
- 웹 단축키 `s`, `Space`를 지원한다.

## 진행

- 작업 브랜치: codex/card-review-flow-skip
- 작업 워크트리: yeon-2
- 패리티 범위: card-service web/mobile 복습 모드

## 예정 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/mobile lint`
- `pnpm verify:parity`
- `git diff --check`
- Playwright 웹 복습 모드 smoke

## 완료

- 웹 복습 카드는 최초에 문제와 정답 확인 버튼만 표시한다.
- 정답 확인 후 정답과 어려움/좋음/쉬움 선택지를 표시한다.
- `카드 N/전체` 표기로 바꾸고 `|`를 제거했다.
- 리뷰 저장 성공 후 다음 카드로 이동한다. 마지막 카드에서는 첫 카드로 순환한다.
- 스킵 버튼을 오른쪽 상단에 추가했고, 스킵은 난이도 저장 없이 다음 카드로 이동한다.
- 웹 단축키 `Space`는 정답 확인, `s`는 스킵으로 동작한다.
- 모바일 복습 패널도 정답 확인 전 답/난이도 숨김을 따르고, 복습 중 상단 오른쪽 액션을 스킵으로 맞췄다.

## 검증

- `CI=true pnpm --filter @yeon/web typecheck`
- `CI=true pnpm --filter @yeon/ui typecheck`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/ui lint`
- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm verify:parity`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- Playwright smoke: `card-review-smoke ok deck=e2e-review-mq2cgiky`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`는 0으로 종료됐지만 프로젝트 git 저장소 인식 실패 메시지로 project-only 점검을 건너뜀
