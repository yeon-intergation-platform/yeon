# next backend role removal plan

- 작업 목표: Next 백엔드 역할 제거 및 Spring Flyway 단일화 계획 수립 후 1차 실수유발요인 제거
- 작업 범위: 계획 문서, apps/web dev 자동 Drizzle migration 제거, apps/web README 책임 경계 정리
- 비목표: 잔여 16개 route 전환 전체 수행, Drizzle 파일/의존성 즉시 삭제, CI boundary gate 추가
- 사용자 방향: CI 추가는 필요 없고, 제대로 계획한 뒤 바로 개발 진행
- 기준 브랜치: origin/main

## 진행

- 현재 보수 기준 진행률: 97/113 = 85.8%
- 목표: 113/113 = 100%
- 1차 개발 조치: Next dev 시작 시 DB migration 자동 실행 제거
- 1차 개발 조치: web Drizzle generate/migrate 스크립트는 Spring Flyway 안내 후 실패하도록 변경

## 검증

- `apps/web/package.json` script scan: `dev`에서 `drizzle-kit migrate` 제거 확인
- `pnpm --filter @yeon/web db:migrate`: 의도대로 실패하며 Spring Flyway 안내 출력 확인
- `git diff --check`: 통과
- `bash bin/sync-skills.sh --check`: 통과
- `bash bin/verify-ssot.sh --project-only`: worktree의 `.git` file 구조 때문에 프로젝트 검사는 스킵되고 전역 SSOT만 OK 확인
