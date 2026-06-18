# UI 디자인 변경 스크린샷 증거 규칙

## 목표

- 앞으로 UI/디자인 개발 시 수정 화면의 위치와 변화 내용을 스크린샷으로 남기도록 저장소 규칙을 고정한다.

## 변경 예정

- `docs/guides/design-screenshot-evidence.md` 추가
- `docs/guides/README.md` 가이드 목록 갱신
- `docs/product/backlog/2026-06-19-design-screenshot-evidence-rule.md` 추가
- `AGENTS.md`에 필수 참조 추가
- `.claude/memory/retrospective-log.md` 회고 항목 추가

## 검증 예정

- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 진행 상태

- 완료

## 결과

- UI/디자인 변경 스크린샷 증거 규칙을 `docs/guides/design-screenshot-evidence.md`로 추가했다.
- `AGENTS.md`에 필수 참조와 완료 조건을 연결했다.
- 회고 로그에 스크린샷 증거 누락 패턴의 재발 방지 규칙을 남겼다.

## 검증

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
