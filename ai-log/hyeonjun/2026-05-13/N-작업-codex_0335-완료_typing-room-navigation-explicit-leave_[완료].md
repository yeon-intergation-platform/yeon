# typing room navigation explicit leave 완료

## 목표

타자방 대기 화면에서 나가기 버튼뿐 아니라 화면 안의 명확한 내부 페이지 이동도 explicit leave로 처리한다.

## 범위

- `apps/web/src/features/typing-service/typing-room-screen.tsx`
- `docs/product/backlog/typing-room-lifecycle-grace-20260513.md`

## 구현 결과

- 대기방 화면 루트에 내부 링크 클릭 capture를 추가했다.
- 같은 탭 내부 링크 이동은 `race.leaveRoom()` 후 원래 목적지로 이동한다.
- modifier 클릭, 새 탭, 다운로드, 외부 링크, 동일 URL/hash 이동은 가로채지 않는다.
- 브라우저 새로고침/탭 종료는 계속 React cleanup의 temporary disconnect 정책에 맡긴다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
