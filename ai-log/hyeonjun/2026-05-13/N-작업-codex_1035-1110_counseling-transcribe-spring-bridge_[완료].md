# counseling transcribe Spring bridge 전환

## 목표

- `apps/web/src/app/api/v1/counseling-records/[recordId]/transcribe/route.ts`의 `retryCounselingRecordTranscription` 직접 호출을 제거한다.
- Spring `POST /counseling-records/{recordId}/transcribe`가 재전사 상태 전환과 STT 저장을 소유하게 한다.

## 완료 내용

- Spring `POST /counseling-records/{recordId}/transcribe` API, service, repository를 추가했다.
- Next transcribe route는 인증 후 Spring client 호출/응답 검증만 수행한다.
- 일반 직접 STT 가능한 업로드의 재전사 상태 전환, 원본 음성 다운로드, OpenAI STT 호출, transcript 저장을 Spring으로 옮겼다.
- 긴 음성 분할 전사는 Spring 후속 보강 대상으로 남겼다.

## 검증

- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.counseling_record_transcription.controller.CounselingRecordTranscriptionControllerTests'`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/counseling-records/[recordId]/__tests__/transcribe-route.test.ts'`
- `pnpm --filter @yeon/web build`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
