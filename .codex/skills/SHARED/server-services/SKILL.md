---
name: server-services
description: |-
  서버 레이어 구조(서비스→레포지터리→DB), DB 변경 절차, Route Handler 원칙. apps/web/src/server 작업 시 로드한다.
---

# server-services

이 파일은 Codex 측 얇은 wrapper다. 실제 규칙의 출처는 아래 SSOT다.

## Source of Truth

- `docs/agent-rules/server-services.md`

## Execution

1. `Read("docs/agent-rules/server-services.md")`를 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 규칙을 authoritative하게 따른다.
3. 이 wrapper를 직접 수정하지 않는다. 규칙 변경은 SSOT 파일에서만 한다.
