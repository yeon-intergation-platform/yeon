# 23-작업-codex*1618-typing-rewards-xp-coins-ralplan*[진행]

## 목표

타자 연습/레이스 완료 후 경험치·코인·레벨업 보상을 지급하는 기능의 구현 계획을 `$ralplan`으로 합의한다.

## 현재 근거

- 기존 `users`에는 XP/coin/level 필드가 없다.
- 솔로 결과는 클라이언트 내부 상태이며 persistence가 없다.
- 멀티 순위는 race-server가 계산하지만 보상 원장은 없다.
- 보상은 서버 원장/멱등 지급 중심으로 설계해야 한다.

## 진행

- [x] git status 확인
- [x] typing-race / yeon context 로드
- [x] brownfield touchpoint 조사
- [x] Planner → Architect → Critic consensus
- [x] 최종 계획 정리

## 결과

- `.omx/plans/prd-typing-rewards-xp-coins.md` 작성 완료.
- `.omx/plans/test-spec-typing-rewards-xp-coins.md` 작성 완료.
- Architect 1차 ITERATE → 수정 → APPROVE.
- Critic ITERATE → participant-token/env/docs 보강.
- Architect final-rank ITERATE → `finalizeRaceResults()` 보강 → APPROVE.
- Critic 최종 APPROVE.
