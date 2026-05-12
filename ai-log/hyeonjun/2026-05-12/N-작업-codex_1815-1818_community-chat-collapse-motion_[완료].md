# 커뮤니티 실시간 채팅 닫힘 모션

- 시작: 18:15
- 범위: `CommunityChatWidget` compact variant 닫힘 모션
- 목표: 닫을 때 본문이 눌리며 폭이 즉시 줄어드는 현상 제거
- 원인 가설: `isCollapsed` 하나로 본문 unmount와 컨테이너 width 축소를 동시에 제어해 exit 중 본문이 좁은 폭에 압축됨
- 계획: 본문 접힘 상태와 shell width 접힘 상태를 분리하고, body exit 완료 후 shell을 축소한다.
- 완료: 18:18
- 변경: 본문 exit 상태와 shell 폭 축소 상태를 분리해 닫힘 시 본문이 절반 폭으로 눌리지 않게 함
- 검증: `pnpm --filter @yeon/web exec eslint src/features/community/components/community-chat-widget.tsx`, `pnpm --filter @yeon/web typecheck`, `git diff --check`, `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web build` 통과
