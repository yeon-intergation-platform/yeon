---
name: service-context-card-decks
description: |-
  카드/덱 학습 보조 서비스 작업에서 팀원이 기능/디자인/경계 컨텍스트를 빠르게 로드하기 위한 서비스별 킥오프 스킬. `/card-service`, card deck API, guest deck merge 작업에 사용한다.
---

# service-context-card-decks

이 파일은 **Codex 측 얇은 wrapper**다. 절차의 실제 출처는 아래 SSOT 파일이다.

## Source of Truth

- `.claude/skills/service-context-card-decks.md`

## Execution

**첫 단계로 반드시 source 파일을 Read 하라.** 본 wrapper 의 요약이나 지시어만으로 절차를 수행하지 말 것.

1. `Read(".claude/skills/service-context-card-decks.md")` 을 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 절차, 체크리스트, 출력 형식을 authoritative 하게 그대로 따른다.
3. 사용자가 전달한 인자($ARGUMENTS)가 있으면 그 의도를 유지한 채 동일 workflow 로 실행한다.
4. 이 wrapper 는 `bin/sync-skills.sh` 가 자동 생성한다. 직접 수정하지 말고 SSOT 파일을 편집한다.
