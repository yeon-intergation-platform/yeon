---
name: api-contract
description: |-
  API contract 변경 시 소비자 범위, Zod 스키마 규칙, 패키지 경계 확인. packages/api-contract/** 작업 시 로드한다.
---

# api-contract

이 파일은 Codex 측 얇은 wrapper다. 실제 규칙의 출처는 아래 SSOT다.

## Source of Truth

- `docs/agent-rules/api-contract.md`

## Execution

1. `Read("docs/agent-rules/api-contract.md")`를 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 규칙을 authoritative하게 따른다.
3. 이 wrapper를 직접 수정하지 않는다. 규칙 변경은 SSOT 파일에서만 한다.
