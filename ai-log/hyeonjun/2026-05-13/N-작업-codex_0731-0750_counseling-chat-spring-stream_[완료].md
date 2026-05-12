# 상담 AI 채팅 Spring 스트리밍 이관

## 목표

- `apps/web/src/app/api/v1/counseling-records/[recordId]/chat/route.ts`에서 상담 상세 조회, assistant_messages DB append/clear, OpenAI 호출 책임을 제거한다.
- Spring이 상담 원문 기반 AI 채팅, 웹 검색 fallback, 메시지 저장/초기화를 소유한다.
- Next route는 인증, Zod validation, Spring SSE/JSON bridge만 수행한다.

## 진행

- Spring `POST /counseling-records/{recordId}/chat` SSE API 추가.
- Spring `DELETE /counseling-records/{recordId}/chat` 초기화 API 추가.
- Spring AI service가 사용자 메시지/assistant 메시지를 `assistant_messages` JSONB에 append하도록 구현.
- Next chat route를 Spring client 호출로 축소.

## 검증 예정

- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.counseling_record_ai.controller.CounselingRecordAiControllerTests'`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 검증 결과

- PASS: `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.counseling_record_ai.controller.CounselingRecordAiControllerTests'`
- PASS: `pnpm --filter @yeon/web typecheck`
- PASS: `pnpm --filter @yeon/web build`
- PASS: `git diff --check`
- PASS: `bash bin/sync-skills.sh --check`
- PASS: `bash bin/verify-ssot.sh --project-only`

## 남은 Next backend-role import

- `chat-service/_shared.ts`
- `counseling-records/[recordId]/analyze/route.ts`
- `counseling-records/[recordId]/transcribe/route.ts`
- `counseling-records/route.ts`
- `integrations/_shared.ts`
