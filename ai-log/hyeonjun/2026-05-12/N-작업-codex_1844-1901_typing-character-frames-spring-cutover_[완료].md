# typing-character-frames spring cutover

- 작업 목표: typing-character-frames 2개 Next route의 repository 직접 접근 제거
- 작업 범위: Spring controller/service/repository/Flyway, web Spring client, route proxy 전환, 검증
- 비목표: 전체 Next auth session Spring 이전, Drizzle legacy 파일 삭제, CI boundary gate 추가
- 기준 브랜치: origin/main

## 진행

- 전환 전 route 직접 repository import: 2개
- 선택: Next는 user id bridge만 담당하고 Spring이 admin 권한 판정과 DB write를 담당

## 결과

- Spring `typing_character_frames` controller/service/repository 추가
- Spring Flyway `V5__ensure_public_typing_character_frame_overrides.sql` 추가
- Next `typing-character-frames` route 2개를 Spring client 호출로 전환
- API route의 `@/server/repositories/*` 직접 import: 2개 → 0개
- 보수 잔여 route 기준: 11개 남음, 진행률 102/113 = 90.3%

## 검증

- `./gradlew test --tests 'world.yeon.backend.typing_character_frames.controller.TypingCharacterFrameControllerTests'`: 통과
- `pnpm --filter @yeon/web typecheck`: 통과
- `pnpm --filter @yeon/web build`: 통과
- route import scan: `typing-character-frames` route의 repository/db 직접 import 0개 확인
- repo-wide route repository import count: 0개 확인
- `git diff --check`: 통과
- `bash bin/sync-skills.sh --check`: 통과
- `bash bin/verify-ssot.sh --project-only`: worktree 구조로 프로젝트 검사는 스킵되고 전역 SSOT OK
