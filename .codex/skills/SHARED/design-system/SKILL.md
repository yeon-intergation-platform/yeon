---
name: design-system
description: |-
  서비스별 색상 토큰 규칙. 새 UI 작업, 색상 추가, 서비스 테마 확인 시 로드한다.
---

# design-system

이 파일은 Codex 측 얇은 wrapper다. 실제 규칙의 출처는 아래 SSOT다.

## Source of Truth

- `docs/agent-rules/design-system.md`

## Execution

1. `Read("docs/agent-rules/design-system.md")`를 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 규칙을 authoritative하게 따른다.
3. 이 wrapper를 직접 수정하지 않는다. 규칙 변경은 SSOT 파일에서만 한다.
