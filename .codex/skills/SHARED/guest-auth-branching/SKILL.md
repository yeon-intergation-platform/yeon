---
name: guest-auth-branching
description: |-
  yeon의 게스트(로컬 store) ↔ 인증(서버 API) 분기 패턴. 같은 도메인 인터페이스에서 mutation/query/캐시 무효화/병합 흐름을 통일한다. 트리거: 새 도메인에 게스트 모드 도입, `guestStore` 또는 `useIsAuthenticated` 신규 사용, `merge-guest-*` 컴포넌트/훅 작성.
---

# guest-auth-branching

이 파일은 **Codex 측 얇은 wrapper**다. 절차의 실제 출처는 아래 SSOT 파일이다.

## Source of Truth

- `.claude/commands/guest-auth-branching.md`

## Execution

**첫 단계로 반드시 source 파일을 Read 하라.** 본 wrapper 의 요약이나 지시어만으로 절차를 수행하지 말 것.

1. `Read(".claude/commands/guest-auth-branching.md")` 을 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 절차, 체크리스트, 출력 형식을 authoritative 하게 그대로 따른다.
3. 사용자가 전달한 인자($ARGUMENTS)가 있으면 그 의도를 유지한 채 동일 workflow 로 실행한다.
4. 이 wrapper 는 `bin/sync-skills.sh` 가 자동 생성한다. 직접 수정하지 말고 SSOT 파일을 편집한다.
