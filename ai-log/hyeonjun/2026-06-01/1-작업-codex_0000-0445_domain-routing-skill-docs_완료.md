# domain-routing skill docs 작업 로그

## 목표

- 서비스 path URL을 subdomain URL로 전환하기 위한 운영 문서와 300단계 체크리스트를 작성한다.
- Claude/Codex/.agents가 자동 참조할 수 있는 domain-routing wrapper skill을 추가한다.

## 제약

- 기존 다른 에이전트 변경은 건드리지 않는다.
- 상담 워크스페이스는 유지보수 대상이 아니므로 이 작업 범위에 포함하지 않는다.
- 실제 Cloudflare 변경은 이번 문서 작업 범위에 포함하지 않는다.

## 산출물

- `docs/deployment/domain-routing.md`
- `docs/deployment/domain-routing-checklist-300.md`
- `.claude/skills/omc/context/domain-routing.md`
- `.claude/commands/domain-routing.md`
- `.codex/skills/SHARED/domain-routing/SKILL.md`
- `.agents/skills/domain-routing/SKILL.md`
- `docs/product/backlog/domain-subdomain-routing-skill-20260601.md`

## 검증 예정

- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 진행

- 운영 도메인 라우팅 SSOT 작성 완료
- 300단계 체크리스트 작성 완료
- Claude/Codex/.agents wrapper skill 작성 완료

## 검증 결과

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- `docs/deployment/domain-routing-checklist-300.md` 체크리스트 항목 300개 확인

## 남은 리스크

- 이번 작업은 문서/스킬 추가이며 실제 Cloudflare DNS/Tunnel/Access 변경과 앱 rewrite 구현은 수행하지 않았다.
- 실제 전환 전 현재 Cloudflare 대시보드와 운영 로그 확인이 필요하다.
