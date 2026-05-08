---
name: card-service
description: |-
  카드 서비스 UI/게스트 분기/API 규칙. card-service(web/mobile) 작업 시 로드한다.
---

# card-service

이 파일은 Codex 측 얇은 wrapper다. 실제 규칙의 출처는 아래 SSOT다.

## Source of Truth

- `docs/agent-rules/card-service.md`

## Execution

1. `Read("docs/agent-rules/card-service.md")`를 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 규칙을 authoritative하게 따른다.
3. 이 wrapper를 직접 수정하지 않는다. 규칙 변경은 SSOT 파일에서만 한다.
