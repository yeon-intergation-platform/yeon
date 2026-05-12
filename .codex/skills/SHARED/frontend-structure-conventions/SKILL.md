---
name: frontend-structure-conventions
description: |-
  yeon apps/web 프론트 구조 표준. app route boundary와 features product boundary 분리, God component/hook 분해, server/local/optimistic/draft 상태 소유권을 점검한다. 트리거: apps/web의 app/* 또는 features/* 구조를 만들거나 옮기거나 큰 React 컴포넌트/훅을 수정할 때.
---

# frontend-structure-conventions

이 파일은 **Codex 측 얇은 wrapper**다. 절차의 실제 출처는 아래 SSOT 파일이다.

## Source of Truth

- `.claude/commands/frontend-structure-conventions.md`

## Execution

**첫 단계로 반드시 source 파일을 Read 하라.** 본 wrapper 의 요약이나 지시어만으로 절차를 수행하지 말 것.

1. `Read(".claude/commands/frontend-structure-conventions.md")` 을 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 절차, 체크리스트, 출력 형식을 authoritative 하게 그대로 따른다.
3. 사용자가 전달한 인자($ARGUMENTS)가 있으면 그 의도를 유지한 채 동일 workflow 로 실행한다.
4. 이 wrapper 는 `bin/sync-skills.sh` 가 자동 생성한다. 직접 수정하지 말고 SSOT 파일을 편집한다.
