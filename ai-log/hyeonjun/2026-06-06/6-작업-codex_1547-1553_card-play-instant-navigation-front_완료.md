# 카드 플레이 이동 flip transition 제거 작업 로그

## 목표
- 앞/뒷면 클릭 전환은 유지
- 이전/다음 문제 이동 시에는 애니메이션 없이 다음 카드 앞면 즉시 표시

## 진행
- 작업 브랜치: codex/card-play-instant-navigation-front
- 작업 워크트리: yeon-4

## 완료
- 인덱스 변경 렌더에서는 이전 뒷면 상태를 무시하고 앞면을 즉시 렌더링하도록 변경
- 인덱스 변경 렌더에서는 flip transition class를 제거하여 이동 시 회전 애니메이션 방지
- 클릭/Space/Enter로 같은 카드를 뒤집을 때는 기존 transition 유지

## 검증
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
- Playwright smoke: 클릭 flip은 transitionstart 1회, 뒤집힌 상태에서 다음 이동은 transitionstart 0회 및 앞면 즉시 표시
- `pnpm build:web`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
