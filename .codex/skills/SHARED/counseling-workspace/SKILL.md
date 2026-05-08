---
name: counseling-workspace
description: |-
  상담 워크스페이스 원문/요약/AI 채팅 규칙, 용어, 주요 파일. counseling/student-management 작업 시 로드한다.
---

# counseling-workspace

이 파일은 Codex 측 얇은 wrapper다. 실제 규칙의 출처는 아래 SSOT다.

## Source of Truth

- `docs/agent-rules/counseling-workspace.md`

## Execution

1. `Read("docs/agent-rules/counseling-workspace.md")`를 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 규칙을 authoritative하게 따른다.
3. 이 wrapper를 직접 수정하지 않는다. 규칙 변경은 SSOT 파일에서만 한다.
