---
name: race-server-conventions
description: |-
  yeon Colyseus 멀티플레이 race-server 작성 컨벤션. seed 무결성, room state, message protocol, packages/race-shared 동기화를 통일한다. 트리거: 경로가 `apps/race-server/**`이거나 `packages/race-shared/**`, `packages/typing-race-engine/**` 변경 시.
---

# race-server-conventions

이 파일은 **Codex 측 얇은 wrapper**다. 절차의 실제 출처는 아래 SSOT 파일이다.

## Source of Truth

- `.claude/commands/race-server-conventions.md`

## Execution

**첫 단계로 반드시 source 파일을 Read 하라.** 본 wrapper 의 요약이나 지시어만으로 절차를 수행하지 말 것.

1. `Read(".claude/commands/race-server-conventions.md")` 을 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 절차, 체크리스트, 출력 형식을 authoritative 하게 그대로 따른다.
3. 사용자가 전달한 인자($ARGUMENTS)가 있으면 그 의도를 유지한 채 동일 workflow 로 실행한다.
4. 이 wrapper 는 `bin/sync-skills.sh` 가 자동 생성한다. 직접 수정하지 말고 SSOT 파일을 편집한다.
