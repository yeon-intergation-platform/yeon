---
name: route-state-contract
description: |-
  yeon 신규 화면/페이지에서 상태 저장 위치를 결정하는 3계층 룰. reload-safe 상태는 URL을 SoT, 사용자 작성 중인 큰 데이터는 server-backed draft ID, ephemeral UI만 메모리. 트리거: `apps/web/src/app/**/page.tsx` 신규 작성, `useSearchParams`/`router.replace`/`URLSearchParams` 첫 도입, 또는 새 화면의 URL 쿼리 키 추가.
---

# route-state-contract

이 파일은 **Codex 측 얇은 wrapper**다. 절차의 실제 출처는 아래 SSOT 파일이다.

## Source of Truth

- `.claude/commands/route-state-contract.md`

## Execution

**첫 단계로 반드시 source 파일을 Read 하라.** 본 wrapper 의 요약이나 지시어만으로 절차를 수행하지 말 것.

1. `Read(".claude/commands/route-state-contract.md")` 을 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 절차, 체크리스트, 출력 형식을 authoritative 하게 그대로 따른다.
3. 사용자가 전달한 인자($ARGUMENTS)가 있으면 그 의도를 유지한 채 동일 workflow 로 실행한다.
4. 이 wrapper 는 `bin/sync-skills.sh` 가 자동 생성한다. 직접 수정하지 말고 SSOT 파일을 편집한다.
