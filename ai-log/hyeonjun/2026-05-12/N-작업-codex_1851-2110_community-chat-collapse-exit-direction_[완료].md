# 커뮤니티 채팅 패널 닫힘 방향 정합 작업

## 목표

컴팩트 실시간 채팅 패널이 닫힐 때 아래 고정 버튼으로 접히는 느낌이 나도록 본문 exit y 방향을 아래쪽으로 맞춘다.

## 원인

현재 `chat-widget-body` exit motion이 `y: -10`이라 본문이 위로 빠지며 사라지는 느낌을 만든다. 컨테이너는 아래 고정 버튼 기준으로 줄어드므로 exit 방향은 `y: 10`이 더 자연스럽다.

## 검증 계획

- 변경 파일 단위 diff 확인
- `pnpm --filter @yeon/web lint`
- `git diff --check`

## 변경

- `chat-widget-body` compact motion을 위치 이동이 아니라 `height: 0` collapse 기반으로 조정했다.
- exit 중 padding top/bottom도 0으로 줄여 본문 여백이 남지 않게 했다.

- 닫힘 전환 중에는 `isShellCollapsed && isBodyCollapsed`가 모두 참일 때만 채팅 열기 아이콘/원형 shell을 보여주도록 조건을 명확히 했다.

## 머지 준비

- 사용자 지시에 따라 남은 dirty/untracked 변경을 모두 `origin/main` 기준 브랜치로 옮겨 PR 머지 대상으로 묶었다.
- 포함 범위: 커뮤니티 채팅 접힘 모션, 관련 백로그/작업 로그, backend my-profile controller test package 보정.
