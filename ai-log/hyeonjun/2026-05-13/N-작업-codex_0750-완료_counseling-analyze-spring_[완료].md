# 상담 기록 분석 Spring 이관

## 목표

- `apps/web/src/app/api/v1/counseling-records/[recordId]/analyze/route.ts`에서 `runAnalysisForRecord` 직접 호출을 제거한다.
- Spring이 분석 상태 전이, OpenAI JSON 분석 호출, 결과 저장을 소유한다.
- Next route는 인증 후 Spring JSON 응답 검증/전달만 수행한다.

## 진행

- Spring `POST /counseling-records/{recordId}/analyze` API 추가.
- Spring AI service에 상담 기록 분석 실행/저장 로직 추가.
- Next analyze route를 Spring client 호출로 축소.

## 완료 근거

- Spring controller test: `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.counseling_record_ai.controller.CounselingRecordAiControllerTests'` 통과.
- Web typecheck: `pnpm --filter @yeon/web typecheck` 통과.
- Web build: `pnpm --filter @yeon/web build` 통과.
- `apps/web/src/app/api/v1/counseling-records/[recordId]/analyze/route.ts`의 `runAnalysisForRecord` 직접 호출 제거.
