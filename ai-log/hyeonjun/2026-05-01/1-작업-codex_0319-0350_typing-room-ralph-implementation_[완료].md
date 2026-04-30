# 타자방 MVP Ralph 구현

- 시작: 03:19
- 예상 종료: 05:00
- 실제 종료: 03:50
- 상태: 완료
- 입력 계획: .omx/plans/consensus-typing-room-mvp-redesign.md
- 브랜치: feature/typing-room-mvp-redesign
- 목표: Slice A 구현 + 검증 + PR main merge

## 범위
- 로비 기반 실시간 타자방 MVP Slice A
- finish mode / 1라운드 / short KO·EN / 2·4명 / 서버 권위 result snapshot
- 제외: 랭크 시즌, 친구, 채팅, 아이템, 팀, 관전, 음성, DB persistence

## 구현
- `packages/race-shared/src/typing-race.ts`
  - participant/result snapshot 계약 확장
  - CPM/WPM, accuracy, mistakeCount, elapsedTimeMs, score, rank 타입 추가
  - `calculateTypingScore`, `toWpmFromCpm`, `rankTypingResults` 유틸 추가
- `packages/race-shared/src/typing-race.test.ts`
  - scoring/clamp/CPM→WPM/ranking 테스트 추가
- `apps/race-server/src/rooms/typing-race-room.ts`
  - Slice A settings 정규화(public, 2/4, short, KO/EN, 1 round, finish)
  - finish 시 서버에서 score/rank/result snapshot 생성 및 broadcast
  - stale finish counter 제거
- `apps/web/src/features/typing-service/*`
  - 방 만들기/입장 옵션을 Slice A로 제한
  - 실시간 진행률, CPM/WPM, 정확도, 오타, 경과 시간 표시
  - 서버 result snapshot 기반 결과 카드 표시
  - “학습방”/친구 범위 카피 제거

## Team/Ralph 처리
- `omx team 5:executor` 실행 시 팀 워커는 모두 commit `54d1521` 기반 detached worktree로 생성됨.
- worker 산출 diff는 없었고 shutdown 결과 모두 `merge_outcome: noop`.
- 팀 임시 worktree는 `omx team shutdown ralph-typing-room-mvp-slice-a --force --confirm-issues`로 정리 완료.
- main에는 이번 기능 브랜치의 검증된 커밋만 넣는다. 기존 다른 worktree의 작업은 포함하지 않는다.

## Deslop
- 변경 파일 한정으로 정리.
- friend-scope copy를 “초대 링크”로 변경.
- `RACE_RESULT` placement가 finished result snapshot rank와 일치하도록 정리.
- 불필요한 counter/공백 제거.

## 검증
- PASS `pnpm --filter @yeon/race-shared test`
- PASS `pnpm --filter @yeon/race-shared typecheck`
- PASS `pnpm --filter @yeon/race-shared lint`
- PASS `pnpm --filter @yeon/race-server typecheck`
- PASS `pnpm --filter @yeon/race-server lint`
- PASS `pnpm --filter @yeon/web typecheck`
- PASS `pnpm --filter @yeon/web lint`
- PASS `pnpm --filter @yeon/web build`
- PASS `git diff --check`
- PASS pre-commit `pnpm lint`
- PASS pre-commit `pnpm typecheck`

## 비고
- Playwright는 이번 Ralph 검증에서 실행하지 않았다.
- 수동 2브라우저 실시간 대결 QA는 후속으로 남김.
