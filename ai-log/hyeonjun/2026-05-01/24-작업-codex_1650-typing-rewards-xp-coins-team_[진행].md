# 24-작업-codex*1650-typing-rewards-xp-coins-team*[진행]

## 목표

`$team`으로 `.omx/plans/prd-typing-rewards-xp-coins.md`와 `.omx/plans/test-spec-typing-rewards-xp-coins.md` 기반 typing rewards XP/coins/level 기능을 병렬 구현한다.

## 제약

- main-only 정책, develop 금지.
- 현재 leader workspace에는 기존 dirty typing-service 변경이 있으므로 team 기본 worktree 격리와 owned-path staging을 유지한다.
- 보상은 web-owned ledger + required solo attempts + recipient-bound race signed claim + final locked race results 이후에만 지급한다.

## 진행

- [x] tmux/omx preflight 확인
- [x] ralplan 산출물 확인
- [ ] `omx team 4:executor` launch
- [ ] startup evidence 확인
- [ ] team status/await monitoring
- [ ] verification/shutdown
