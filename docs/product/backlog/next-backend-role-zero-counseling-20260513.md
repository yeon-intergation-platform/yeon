# Next 백엔드 역할 0% - counseling-records Spring 이관 백로그 (2026-05-13)

## 목표

`apps/web/src/app/api/v1/counseling-records/**`에 남은 Next-side 서버 서비스 호출을 Spring API 호출 브리지로 전환해 Next.js의 백엔드 역할을 제거한다.

## 1차 - 상담 transcript segment mutation Spring 이관 (완료)

- 작업내용
  - Spring `counseling_record_mutation`에 segment 단건 수정 API를 추가한다.
  - Spring `counseling_record_mutation`에 speaker label bulk 수정 API를 추가한다.
  - Web Next route는 Zod validation, 인증/쿠키 bridge, Spring client 호출, 응답 매핑만 담당하게 한다.
  - 기존 response contract(`updateSegmentResponseSchema`, `bulkUpdateSpeakerResponseSchema`)를 유지한다.
- 논의 필요
  - 없음. 사용자 방향은 Next backend role 0%이며, segment mutation은 현재 남은 `api/v1` backend-role 중 가장 작고 검증 가능한 단위다.
- 선택지
  - A. segment mutation 2개만 먼저 작은 PR로 이관한다.
  - B. counseling-records 전체 create/analyze/chat/transcribe/trend까지 한 번에 이관한다.
- 추천
  - A. DB mutation과 응답 contract를 먼저 Spring으로 고정해 이후 분석/스트리밍 이관 리스크를 줄인다.
- 사용자 방향
  - 추천 기준으로 진행한다.
- 완료 근거
  - Spring segment 단건 수정/bulk speaker 수정 API와 Next Spring bridge 전환을 구현했다.
  - backend controller test, web typecheck/build, diff/skill/SSOT 검증을 수행했다.

## 2차 - 상담 분석/채팅/재전사 streaming Spring 이관

### 2차 세부 - 상담 기록 분석 Spring 이관 (완료)

- 작업내용
  - `POST /api/v1/counseling-records/[recordId]/analyze`의 분석 상태 전이, OpenAI JSON 분석, 결과 저장을 Spring으로 이동한다.
  - Next route는 인증 후 Spring JSON 응답 검증/전달만 유지한다.
- 논의 필요
  - 긴 원문 section 요약 최적화는 Spring 분석 소유권 이관 뒤 별도 고도화로 둔다.
- 선택지
  - A. analyze 단독 PR로 이관
  - B. transcribe까지 묶기
- 추천
  - A. 분석 상태 전이와 AI JSON 저장 경계를 단독 검증한다.
- 사용자 방향
  - 추천 기준으로 진행.
- 완료 근거
  - Spring `POST /counseling-records/{recordId}/analyze`가 분석 상태 전이, OpenAI JSON 분석, 결과/오류 저장을 소유한다.
  - Next analyze route는 인증 후 Spring 응답을 `analyzeRecordResponseSchema`로 검증해 전달한다.
  - backend controller test, web typecheck/build 통과.

### 2차 세부 - 상담 AI 채팅 Spring 이관 (완료)

- 작업내용
  - `POST /api/v1/counseling-records/[recordId]/chat`의 상담 상세 조회, OpenAI chat/web-search 호출, assistant_messages 저장을 Spring으로 이동한다.
  - `DELETE /api/v1/counseling-records/[recordId]/chat`의 assistant_messages 초기화도 Spring으로 이동한다.
  - Next route는 인증, 요청 검증, Spring SSE/JSON bridge만 유지한다.
- 논의 필요
  - 웹 검색 모드는 기존처럼 Responses API 실패 시 일반 AI 응답으로 fallback한다.
- 선택지
  - A. chat만 단독 PR로 이관
  - B. analyze/transcribe까지 한 PR에 묶기
- 추천
  - A. 스트리밍과 DB append 경계가 있으므로 chat 단독 PR로 검증한다.
- 사용자 방향
  - 추천 기준으로 진행.
- 완료 근거
  - Spring `POST/DELETE /counseling-records/{recordId}/chat`가 OpenAI chat/web-search, assistant_messages append/clear를 소유한다.
  - Next chat route는 인증/검증 후 Spring SSE/JSON bridge만 수행한다.
  - backend controller test, web typecheck/build, diff/skill/SSOT 검증을 수행했다.

- 작업내용
  - `analyze`, `chat`, `transcribe`, `analyze-trend` route의 OpenAI/STT/search/streaming 소유를 Spring service로 옮긴다.
  - Next route는 SSE bridge와 request/response adapter만 유지한다.
- 논의 필요
  - streaming error/event 형식과 기존 클라이언트 호환성 확인.
- 선택지
  - A. API별로 작은 PR 분리.
  - B. AI/streaming 전체를 하나의 PR로 묶음.
- 추천
  - A. 외부 AI 호출과 SSE는 회귀 범위가 커서 API별 검증이 안전하다.
- 사용자 방향
  - 추천 기준으로 진행한다.

## 3차 - 상담 기록 생성/list scheduling 잔여 Spring 이관

- 작업내용
  - `POST /counseling-records` 텍스트/음성 업로드, R2 저장, DB insert, transcription scheduling을 Spring이 소유하게 한다.
  - `GET /counseling-records`에서 Next-side scheduling 보조 호출을 제거하고 Spring list/detail 서비스 책임으로 통일한다.
- 논의 필요
  - R2 업로드 실패 시 보상/삭제 경계.
- 선택지
  - A. text create와 audio create를 분리.
  - B. create 전체를 한 번에 전환.
- 추천
  - A. 저장소와 STT side effect가 다르므로 분리한다.
- 사용자 방향
  - 추천 기준으로 진행한다.

## 4차 - legacy web backend runtime 제거 준비

- 작업내용
  - `apps/web/src/server/services`, `repositories`, `db` 사용처를 재검사한다.
  - 더 이상 route runtime에서 쓰지 않는 legacy DB/service 파일을 삭제 후보로 정리한다.
- 논의 필요
  - 테스트 fixture나 migration 비교용으로 잠시 남길 파일 범위.
- 선택지
  - A. 사용처 0개 확인 후 삭제.
  - B. deprecated 표기 후 다음 PR에서 삭제.
- 추천
  - A. Next backend role 0% 목표에는 runtime 제거가 필요하므로 사용처 0개 단위로 삭제한다.
- 사용자 방향
  - 추천 기준으로 진행한다.

## 2차 세부 - 추이 분석 streaming Spring 이관 (완료)

- 작업내용
  - Spring에 `POST /counseling-records/analyze-trend` SSE API를 추가한다.
  - Spring이 record source 조회, 수강생 일치 검증, OpenAI streaming 호출, SSE event 변환을 소유한다.
  - Next `api/v1/counseling-records/analyze-trend` route는 request validation + Spring SSE bridge만 수행한다.
- 논의 필요
  - 없음. 기존 사용자 가시 response stream 형식(`data: { content }`, `data: [DONE]`)을 유지한다.
- 선택지
  - A. 추이 분석 streaming만 먼저 이관한다.
  - B. chat/analyze/transcribe까지 한 번에 이관한다.
- 추천
  - A. streaming 경계 하나를 먼저 Spring에 고정하고 검증한다.
- 사용자 방향
  - 추천 기준으로 진행한다.
- 완료 근거
  - Spring `POST /counseling-records/analyze-trend` SSE API와 Next Spring bridge 전환을 구현했다.
  - backend controller test, web typecheck/build, diff/skill/SSOT 검증을 수행했다.

## 3차 - chat-service 세션 인증 Spring bridge 정리

### 3차 세부 - chat-service 공용 인증 조회 Spring 이관 (완료)

- 작업내용
  - `apps/web/src/app/api/v1/chat-service/_shared.ts`의 `getChatServiceAuthByToken` 직접 호출을 제거한다.
  - chat-service route 공용 인증은 Spring `GET /chat-service/auth/session` 응답을 검증해 사용한다.
- 논의 필요
  - 세션 쿠키/Authorization Bearer 추출은 Next BFF 경계 역할이므로 유지한다.
- 선택지
  - A. `_shared.ts` 인증 조회만 단독 PR로 이관
  - B. chat-service 전체 route를 한 번에 재검토
- 추천
  - A. 이미 대부분 Spring client를 쓰는 route들의 공용 DB 세션 조회만 먼저 제거한다.
- 사용자 방향
  - 추천 기준으로 진행.
- 완료 근거
  - `_shared.ts`가 세션 토큰 추출 후 Spring auth session 응답으로 profile을 구성한다.
  - `getChatServiceAuthByToken` 직접 DB 조회 import를 제거했다.
  - web typecheck/build 및 chat-service route targeted Vitest 통과.
