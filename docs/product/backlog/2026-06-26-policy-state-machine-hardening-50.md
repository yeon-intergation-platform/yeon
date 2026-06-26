# 운영 정책·상태머신 보강 50개 태스크 장부

## 1차수

### 작업내용

- 유지보수 대상 서비스(카드, 타자, 커뮤니티)의 운영 정책과 상태머신을 50개 태스크로 점검하고 리팩터링한다.
- 구체적이지 않은 정책은 코드에서 재사용 가능한 source of truth로 옮기고, web/mobile/server/shared 사이 드리프트를 줄인다.
- 상태 판정은 중복 if 분기보다 순수 함수와 테스트 가능한 불변식으로 고정한다.

### 논의 필요

- 없음. 사용자가 질문 없이 추천 기준으로 진행하라고 지시했다.

### 선택지

- A. 사용자 영향이 큰 카드방/타자방 실시간 상태부터 SSOT화한다.
- B. 운영 문서 표현을 먼저 정리하고 코드 변경은 뒤로 미룬다.

### 추천

- A. 실제 상태머신 결함 가능성을 먼저 줄이고, 완료 증거를 테스트로 남기는 방식이 운영 안정성에 직접적이다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 진행 현황

- 목표: 50개
- 완료: 36개
- 진행 중: 타자방/카드 저장소/API 경계 상태 정책 후보 조사

## 태스크 체크리스트

- [x] 1.  카드방 시작 가능 조건을 web/mobile 중복 분기에서 shared SSOT로 이동
- [x] 2.  카드방 현재 카드 공개/확정 판정을 shared SSOT로 이동
- [x] 3.  카드방 다음 카드 이동 가능 조건을 shared SSOT로 이동
- [x] 4.  카드방 waiting 상태 판정을 raw 문자열 비교에서 shared SSOT로 이동
- [x] 5.  카드방 finished/closed 종료 상태 판정을 shared SSOT로 이동
- [x] 6.  카드방 내 참가자 탐색 정책을 shared SSOT로 이동
- [x] 7.  카드방 시작 조건에서 host 누락 경계를 테스트로 고정
- [x] 8.  카드방 시작 조건에서 카드 없음 경계를 테스트로 고정
- [x] 9.  카드방 시작 조건에서 memorizer 없음 경계를 테스트로 고정
- [x] 10. 카드방 시작 조건에서 checker 없음 경계를 테스트로 고정
- [x] 11. 카드방 시작 조건에서 준비 안 된 참가자 경계를 테스트로 고정
- [x] 12. 카드방 시작 조건에서 in_progress 상태 차단을 테스트로 고정
- [x] 13. 카드방 공개 판정에서 reveal true 경계를 테스트로 고정
- [x] 14. 카드방 공개 판정에서 result 확정 경계를 테스트로 고정
- [x] 15. 카드방 다음 카드 이동 조건에서 result null 차단을 테스트로 고정
- [x] 16. 카드방 종료 상태에서 finished와 closed 동등 처리를 테스트로 고정
- [x] 17. web 카드방 화면 상태가 shared 정책 함수를 사용하도록 리팩터링
- [x] 18. mobile 카드방 화면 상태가 shared 정책 함수를 사용하도록 리팩터링
- [x] 19. 카드방 역할 기본값이 실제 참가자 없음 상태를 가리지 않게 정리
- [x] 20. 카드방 상태 정책을 race-shared 패키지 테스트로 검증
- [x] 21. 타자방 시작 가능 조건의 participant/player 수 경계 조사
- [x] 22. 타자방 waiting/in_progress/finished 상태 판정 중복 조사
- [ ] 23. 타자방 에러 상태와 재시도 가능 상태 분리
- [ ] 24. 타자방 결과 표시 가능 조건을 shared 정책으로 고정
- [ ] 25. 타자방 랜덤 덱 선택 실패 fallback 정책 구체화
- [x] 26. 타자방 방장 권한 상태 전이를 테스트로 고정
- [x] 27. 타자방 준비 토글 가능 상태를 테스트로 고정
- [ ] 28. 타자방 leave/reconnect 상태 cleanup 경계 고정
- [ ] 29. territory battle phase 전이 가능 조건 조사
- [ ] 30. territory battle 결과 확정 전 UI 노출 정책 고정
- [x] 31. 커뮤니티 guest identity 확정/수정/초기화 상태 정책 조사
- [x] 32. 커뮤니티 presence heartbeat stale cleanup 정책 구체화
- [x] 33. 타자방 로비 채팅 전송 가능 조건을 shared 정책으로 고정
- [x] 34. 커뮤니티 채팅/feed 작성 가능 조건과 게스트 식별 경계 고정
- [ ] 35. 카드 서비스 guest/server 저장소 전환 상태 정책 조사
- [ ] 36. 카드 덱 merge guest 성공/부분 실패/재시도 정책 구체화
- [x] 37. 카드 학습 play 상태 전이의 index 경계 고정
- [x] 38. 카드 학습 review result 중복 입력 방지 경계 고정
- [x] 39. 카드 import parser 실패 정책과 UI 상태 연결 조사
- [x] 40. 카드 asset upload 실패/취소/성공 상태 정책 구체화
- [ ] 41. queryKey 상태 원천이 web/mobile에서 동일한지 검증
- [ ] 42. route-state search params 정책의 null/blank 경계 검증
- [ ] 43. API route BFF 에러 변환 정책에서 status/code 누락 조사
- [ ] 44. Spring-backed card room BFF auth/session 실패 경계 고정
- [ ] 45. race-server card room participant token 요구 정책 문서화/검증
- [x] 46. Universal UI parity registry에 새 shared 상태 정책 필요 여부 검토
- [x] 47. 관련 web lint/typecheck 통과
- [x] 48. 관련 mobile typecheck 통과
- [x] 49. 관련 shared package test/typecheck 통과
- [ ] 50. 장부/작업 로그/PR 증거 정합성 점검

## 완료 증거

- 01~20: `packages/race-shared/src/card-room.ts` 정책 함수와 `packages/race-shared/src/card-room.test.ts` 상태머신 테스트.
- 17: `apps/web/src/features/card-service/use-card-room-screen-state.ts`가 shared 정책 함수를 사용.
- 18~19: `apps/mobile/src/features/card-service/rooms/use-card-room-screen-state.ts`, `card-room-screen-sections.tsx`, `card-service-copy.ts`가 shared 정책 함수와 미배정 역할 라벨을 사용.
- 47: `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`.
- 48: `pnpm --filter @yeon/mobile typecheck`, `pnpm --filter @yeon/mobile lint`.
- 49: `pnpm --filter @yeon/race-shared test -- card-room.test.ts`, `pnpm --filter @yeon/race-shared typecheck`, `pnpm --filter @yeon/race-shared lint`.
- 21~22, 26~27, 33: `packages/race-shared/src/typing-race.ts`의 타자방 로비 정책 함수와 `packages/race-shared/src/typing-room-policy.test.ts` 테스트.
- 21~22, 26~27, 33: `apps/web/src/features/typing-service/typing-room-screen.tsx`, `typing-room-waiting-header.tsx`가 shared 정책 함수를 사용.
- 31, 34: `apps/web/src/features/community/community-guest-identity-confirm.ts`의 게스트 인증 normalize/complete/actor payload 정책과 `use-community-feed.ts` 적용.
- 32: `apps/web/src/features/community/community-presence.ts`의 presence session id 유효성 정책과 `community-presence.test.ts`.
- 34: `apps/web/src/features/community/community-post-format.ts`의 게시글/댓글/채팅 작성 가능 정책과 `community-feed-forms.tsx`, `community-chat-widget.tsx`, `community-chat-form.tsx`, `community-post-detail-page.tsx` 적용.
- 31~32, 34: `pnpm --filter @yeon/web test -- src/features/community/__tests__/community-guest-identity.test.ts src/features/community/__tests__/community-post-format.test.ts src/features/community/__tests__/community-presence.test.ts` 결과 web Vitest 227개 파일/1011개 테스트 통과.
- 37~38: `packages/ui/src/runtime/ports/card-deck/play-policy.ts`의 카드 학습 index/review submit 정책과 `apps/web/src/features/card-service/deck-play-policy.test.ts`.
- 37~38: `apps/web/src/features/card-service/hooks/use-deck-play-state.ts`, `apps/web/src/features/card-service/deck-play-screen.tsx`, `apps/mobile/src/features/card-service/use-card-deck-play-state.ts`가 공용 정책 함수를 사용.
- 46: `pnpm verify:parity` 결과 Parity OK. 새 registry entry 없이 기존 card-service web/mobile 공유 정책 범위에서 통과.
- 39: `apps/web/src/features/card-service/utils/bulk-card-import-parser.ts`의 `deriveBulkCardImportFormPolicy`가 parse 결과 기준 submit/preview 상태를 파생하고 `use-bulk-add-cards-form-state.ts`가 이를 사용.
- 40: `apps/web/src/features/card-service/components/card-editor-image-utils.ts`의 업로드 side 상태/시작 가능 정책이 add form, row editor, upload hook에서 재사용됨.
- 39~40: `pnpm --filter @yeon/web test -- src/features/card-service/utils/bulk-card-import-parser.test.ts src/features/card-service/components/card-editor-image-utils.test.ts` 결과 web Vitest 228개 파일/1019개 테스트 통과.
- 39~40: `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `bash bin/verify-ssot.sh --project-only`, `git diff --check` 통과.
