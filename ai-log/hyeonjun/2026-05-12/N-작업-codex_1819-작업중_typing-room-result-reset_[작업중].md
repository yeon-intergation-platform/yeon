# 타자방 새 시작 결과 상태 초기화

## 목표

- 현재 브랜치에서만 작업한다. 브랜치 switch 금지.
- 타자방에서 한 판 종료 후 대기실 복귀/다시 레이스/시작하기를 거쳐 새 판을 시작할 때 이전 결과 패널이 남지 않게 한다.
- 사용자 지시: 커밋까지만 수행하고 PR/머지 금지.

## 원인 후보

- 서버는 새 시작 시 participant finished/rank/progress를 reset하지만, 웹 `useRaceRoom`이 `roomSnapshot.results`가 빈 배열이면 이전 `RACE_RESULT` state로 fallback한다.
- 멀티플레이 컴포넌트 로컬 입력/finish flag가 새 prompt/countdown 전환에서 함께 정리되지 않으면 완료 상태가 남을 수 있다.

## 검증 예정

- web typecheck 중심 검증
- diff 확인 후 현재 브랜치에 커밋

## 변경

- `useRaceRoom` 결과 배열은 `roomSnapshot`이 존재하면 빈 배열도 그대로 SSOT로 사용하게 변경했다.
- 멀티플레이 화면이 COUNTDOWN 새 라운드에 진입하면 입력/시간/오타/finish 전송 플래그를 초기화한다.
- 별도 백로그 `docs/product/backlog/typing-room-result-reset-20260512.md` 작성.

## 검증

- `pnpm --filter @yeon/web typecheck` 성공
- `git diff --check -- <owned paths>` 성공

## 종료 조건

- 사용자 지시에 따라 PR/머지는 수행하지 않고 커밋까지만 진행한다.
