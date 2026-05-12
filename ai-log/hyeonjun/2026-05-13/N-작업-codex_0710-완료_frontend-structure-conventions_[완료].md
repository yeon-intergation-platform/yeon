# Frontend structure conventions 공식화

## 작업

- `docs/architecture/web-frontend-structure.md`를 추가해 app/feature boundary, server-state 연계, 상태 소유권, God component/hook 분해 기준을 공식 문서화했다.
- `.claude/commands/frontend-structure-conventions.md`를 추가해 AI 에이전트 실행 스킬의 SSOT를 만들었다.
- Codex wrapper는 `bin/sync-skills.sh` 실행으로 생성/검증한다.

## 검증 예정

- `bash bin/sync-skills.sh`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
- 웹 변경 검증 명령
