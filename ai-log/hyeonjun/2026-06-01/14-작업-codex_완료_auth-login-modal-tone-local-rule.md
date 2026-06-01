# 로그인 모달 색상 보정 및 로컬 디버깅 지침 반영 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 로그인 모달 색상을 랜딩/카드/타자 서비스의 흰 배경 톤에 맞추고, 로컬 디버깅/커밋-only 규칙을 프로젝트 내부 상시지침에 반영한다.
- 범위: AGENTS.md, apps/web landing-home login modal, docs/product/backlog, ai-log
- 원칙: 외부 임시 메모리에 프로젝트 상시지침을 저장하지 않는다.

## 변경

- 로그인 모달의 크림색 그라디언트와 auth 성격의 다크 그레이 톤을 제거했다.
- 랜딩/카드/타자 서비스 톤에 맞춰 모달 표면을 흰 배경, 기본 보더, #111/#666 텍스트 중심으로 정리했다.
- 소셜 로그인 버튼은 사용자 인지성이 필요한 브랜드 색을 유지했다.
- 로컬 디버깅/수정 세션의 PR·merge 금지 지침을 프로젝트 내부 `AGENTS.md`에 반영했다.
- 잘못 저장된 외부 임시 메모리 노트를 제거했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
- Playwright: 루트 로그인 모달에서 흰 배경/기본 보더/검정 텍스트 적용, 기존 warm gradient 제거 확인
