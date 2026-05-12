# analyze-trend Spring streaming 이관 작업 로그

- 시작: 2026-05-13 07:16 KST
- 브랜치: `codex/next-backend-zero-counseling-next-20260513`
- 목표: `apps/web/src/app/api/v1/counseling-records/analyze-trend/route.ts`에서 Next legacy AI service 직접 호출을 제거한다.
- 계획:
  - Spring counseling record AI streaming endpoint 추가
  - Web Spring client 추가
  - Next route를 Spring SSE bridge로 축소
  - backend controller test + web typecheck/build 검증

## 진행 결과

- Spring `counseling_record_ai` 모듈을 추가했다.
- `POST /counseling-records/analyze-trend`가 record source 조회와 OpenAI streaming 변환을 소유하게 했다.
- Next `api/v1/counseling-records/analyze-trend`는 request validation과 Spring SSE bridge만 수행하게 변경했다.

## 검증

- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.counseling_record_ai.controller.CounselingRecordAiControllerTests'` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 종료코드 0; linked worktree 구조로 프로젝트 SSOT 점검은 스크립트가 건너뜀

## 남은 작업

- `analyze`, `chat`, `transcribe`, `counseling-records/route.ts`는 아직 Next legacy service 호출이 남아 있다.
