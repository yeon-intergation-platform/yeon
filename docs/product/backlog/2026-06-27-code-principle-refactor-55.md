# 코드 품질 원칙 위반 리팩터링 55개 태스크 장부

## 1차수

### 작업내용

- 첨부 원칙(`/Users/osuma/.codex/attachments/d9fd58ca-d5f1-4f2e-86d5-b9b66ecea9c6/pasted-text-1.txt`)과 코드 품질 SSOT(`/Users/osuma/.codex/skills_context/code-quality-principles.md`) 기준으로 유지보수 대상 서비스의 원칙 위반을 55개 도출하고 리팩터링한다.
- 정상 동작 보존, 최소 변경, 테스트 검증을 우선한다.
- 카드, 타자, 커뮤니티와 그 shared runtime/port 코드만 대상으로 한다.

### 논의 필요

- 없음. 사용자가 질문 없이 추천 기준으로 진행하라고 지시했다.

### 선택지

- A. 중복 정책, 경계값, 오류 처리처럼 회귀 위험을 줄이는 항목부터 작은 배치로 고친다.
- B. 넓은 파일 이동과 구조 개편을 한 번에 수행한다.

### 추천

- A. 첨부 원칙의 기존 정상 동작 보존, 최소 변경, 테스트 검증 우선순위와 맞는다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 진행 현황

- 목표: 55개
- 완료: 25개
- 진행 중: 13~15, 19~20, 25~29, 33~45, 47~48, 51~55번 후속 배치 리팩터링

## 태스크 체크리스트

- [x] 1. 커뮤니티 채팅 timestamp formatter가 매 호출마다 Intl 인스턴스를 새로 만드는 중복 제거 (DRY/KISS)
- [x] 2. 커뮤니티 feed relative fallback formatter가 별도 Intl 설정을 중복 보유하는 문제 제거 (DRY)
- [x] 3. 커뮤니티 post detail formatter가 같은 한국어 날짜 정책을 중복 선언하는 문제 제거 (정책 단일화)
- [x] 4. 커뮤니티 날짜 formatter가 invalid ISO를 그대로 Invalid Date로 넘기는 경계값 보강 (경계값 처리)
- [x] 5. 커뮤니티 relative time이 invalid ISO에서 NaN 경로로 흐르는 문제 보강 (Fail Fast/경계값)
- [x] 6. 커뮤니티 category badge switch가 모든 case에서 같은 class를 반환하는 무의미 분기 제거 (KISS)
- [x] 7. 커뮤니티 category badge class raw 문자열 반복을 상수화 (DRY)
- [x] 8. 타자 서비스 오류 응답 body read 실패 처리와 JSON parse 실패 처리의 정책을 분리 (구체적 예외 처리)
- [x] 9. 타자 서비스 오류 응답 JSON parse에서 SyntaxError 외 예외까지 fallback으로 삼키는 문제 수정 (예외 은닉 금지)
- [x] 10. 타자 서비스 공개 대기방 필터 조건 체인을 의미 있는 predicate로 분리 (자기 설명적 코드)
- [x] 11. 타자 서비스 공개 대기방 summary normalize에서 participants 범위 검증 추가 (경계값 처리)
- [x] 12. 모바일 카드 게스트 opt-in storage read/write fallback 중복을 helper로 분리 (DRY/SRP)
- [ ] 13. 모바일 카드 게스트 opt-in clear에서 browser remove 실패 시 fallback cleanup 정책 명시 (예외 처리)
- [ ] 14. 모바일 카드 세션 boot catch가 token cleanup과 UI state 전이를 한 블록에 섞는 문제 분리 (SRP)
- [ ] 15. 모바일 카드 세션 logout 서버 실패 로깅 정책을 재사용 가능한 helper로 분리 (예외 처리)
- [x] 16. 웹 카드 mutation 401 처리와 deck mutation 401 처리 중복 제거 (DRY)
- [x] 17. 웹 카드 mutation 인증 실패 시 guest/server query invalidation 정책을 공용 함수로 통일 (정책 단일화)
- [x] 18. 웹 카드 list fetch 비정상 응답이 Error만 던지고 status/code를 잃는 문제 보강 (API 계약 일치)
- [ ] 19. 웹 카드 fetch JSON parse 반환이 schema 검증 없이 type assertion만 쓰는 경계 조사 (입력 검증)
- [ ] 20. 웹 카드 room profile parse 실패 처리의 fallback 정책 명시 (예외 은닉 금지)
- [x] 21. 웹 카드 room lobby filter의 waiting raw 문자열 비교를 status 정책으로 이동 (정책 단일화)
- [x] 22. 모바일 카드 room lobby filter의 waiting raw 문자열 비교를 status 정책으로 이동 (정책 단일화)
- [x] 23. 웹 카드 room header의 종료 가능 조건을 closed 단일 비교가 아니라 room 정책으로 표현 (상태 전이 명확화)
- [x] 24. 웹 카드 room study panel 참가자 role 탐색 중복을 shared helper로 대체 (DRY)
- [ ] 25. 모바일 카드 room role label 분기를 mapping으로 단순화 (KISS/OCP)
- [ ] 26. 타자 room screen의 create/join mode raw 비교 반복을 view-state helper로 분리 (DRY)
- [ ] 27. 타자 room screen host/guest role raw 비교를 shared role helper로 통일 (정책 단일화)
- [ ] 28. 타자 room screen participant grouping 로직을 순수 함수로 분리하고 테스트 추가 (작은 함수)
- [ ] 29. 타자 room screen invite copy 실패 메시지 정책을 helper로 분리 (예외 처리)
- [x] 30. 타자 deck form create/update mode 분기를 mapping으로 단순화 (KISS)
- [x] 31. 타자 territory phase label if-chain을 mapping으로 교체 (OCP/KISS)
- [x] 32. 타자 territory screen의 raw `"playing"` phase 비교를 shared constant로 교체 (정책 단일화)
- [ ] 33. 타자 territory screen result publish 조건과 UI 조건의 중복 여부 검증/정리 (상태 전이 명확화)
- [ ] 34. race-server typing room Date.now 직접 호출을 clock/time provider 사용 가능 지점으로 축소 (시간 기준 분리)
- [ ] 35. race-server typing room Math.random 기반 participant/message id 생성 정책 검토 및 helper화 (예측 가능성/테스트 가능성)
- [ ] 36. race-server typing room waiting status guard 반복을 helper로 분리 (DRY)
- [ ] 37. race-server typing room lobbyMode+waiting guard 반복을 helper로 분리 (DRY)
- [ ] 38. race-server typing room onMessage handler별 validation 실패 응답 정책 정리 (입력 검증)
- [ ] 39. race-server territory room Date.now 직접 호출을 clock 기준으로 통일 (시간 기준 분리)
- [ ] 40. race-server territory player joinedAt 생성 정책을 helper로 분리 (시간 기준 분리)
- [ ] 41. race-server backend client 내부 token header 생성 중복 여부 정리 (DRY)
- [ ] 42. race-server card room backend error message에서 Spring 원인 code 보존 여부 검증 (API 계약 일치)
- [ ] 43. 카드 editor image upload catch 블록의 동일 메시지/side-effect 반복 제거 (DRY)
- [ ] 44. 카드 editor image upload clipboard/paste/drop 실패 유형 분리 (실패 유형 명확화)
- [ ] 45. 카드 editor HEIC 변환 오류가 원인 예외를 보존하는지 검증/보강 (원인 예외 보존)
- [x] 46. 카드 markdown code copy 오류 메시지 정책을 card/markdown 컴포넌트에서 공용화 (DRY)
- [ ] 47. 카드 add form image side 상태 업데이트 중복을 reducer/action helper로 정리 (SRP)
- [ ] 48. 카드 bulk import preview 숨김 개수와 submit 가능 조건 테스트 보강 (경계 테스트)
- [x] 49. 카드 deck play date formatting invalid 입력 fallback 검증 (경계값 처리)
- [x] 50. 카드 deck detail mobile/web date formatter 중복 제거 가능성 검토 (DRY)
- [ ] 51. community guest identity localStorage read/write 실패 로깅과 fallback 정책 공용화 (예외 처리)
- [ ] 52. community presence session id legacy cleanup 정책 테스트 확장 (경계 테스트)
- [ ] 53. community feed mutation catch 블록의 반복되는 guest identity confirm 흐름 helper화 (DRY)
- [ ] 54. community chat submit empty message guard와 form disable 조건의 정책 일치 검증 (검증 지속성)
- [ ] 55. 전체 장부, 작업 로그, PR 증거, 검증 명령 정합성 점검

## 완료 증거

- 1~5: `apps/web/src/features/community/community-date-format.ts`에 커뮤니티 날짜 formatter와 relative time 정책을 통합하고 invalid ISO fallback을 추가. `community-date-format.test.ts`로 invalid/relative time 경계를 검증.
- 6~7: `apps/web/src/features/community/components/community-feed-meta.tsx`의 동일 class 반환 switch를 상수로 단순화.
- 8~11: `apps/web/src/features/typing-service/typing-service-fetch.ts`의 오류 JSON parse 정책을 SyntaxError fallback/예상 밖 예외 전파로 분리하고, 공개 대기방 predicate와 participant count normalize를 추가. `typing-service-fetch.test.ts`로 필터/정렬/오류 파싱 경계를 검증.
- 12: `apps/mobile/src/features/card-service/onboarding-storage.ts`의 in-memory fallback read/write/clear helper를 분리.
- 1~12 검증: `pnpm --filter @yeon/web exec vitest run src/features/community/community-date-format.test.ts src/features/typing-service/typing-service-fetch.test.ts`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/mobile typecheck`, `pnpm --filter @yeon/mobile lint` 통과.
- 21~24: `packages/race-shared/src/card-room.ts`에 card room lobby filter, room end 가능 조건, participant role count 정책을 추가하고 web/mobile lobby, web header, web study panel에서 재사용.
- 21~24 검증: `pnpm --filter @yeon/race-shared test -- card-room.test.ts`, `pnpm --filter @yeon/race-shared typecheck`, `pnpm --filter @yeon/race-shared lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/mobile typecheck`, `pnpm --filter @yeon/mobile lint` 통과.
- 16~17: `apps/web/src/features/card-service/hooks/card-service-mutation-policy.ts`에 인증 만료 판정, server/guest query invalidation, 원인 예외 보존 wrapper를 추가하고 card/deck mutation hook이 재사용.
- 18: `apps/web/src/features/card-service/card-service-fetch.ts`의 `listServerCardDecksOrNull`가 401은 guest fallback용 `null`로 유지하고, 그 외 비정상 응답은 `CardServiceApiError`로 status/code/message를 보존.
- 16~18 검증: `pnpm --filter @yeon/web exec vitest run src/features/card-service/card-service-fetch.test.ts src/features/card-service/hooks/card-service-mutation-policy.test.ts`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `bash bin/verify-ssot.sh --project-only`, `git diff --check` 통과.
- 30~32: `typing-deck-form.tsx`의 create mode 판정을 `isCreateMode`로 단일화하고, `getTerritoryPhaseLabel`을 phase mapping으로 교체, territory submit guard의 raw `"playing"` 비교를 `TERRITORY_BATTLE_PHASE.PLAYING`으로 교체.
- 30~32 검증: `pnpm --filter @yeon/web exec vitest run src/features/typing-service/use-territory-battle-room.test.ts`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint` 통과.
- 46: `card-markdown-copy-utils.ts`에 카드 마크다운 코드 복사 실패 메시지 생성을 통합하고 `card-markdown-code-block.tsx`, `markdown-content.tsx`가 재사용.
- 49~50: `@yeon/ui/runtime/ports/card-deck`의 카드 덱 날짜 포맷이 invalid/missing fallback을 보장하고 web/mobile 상세 화면이 동일한 created date formatter를 사용.
- 46,49~50 검증: `pnpm --filter @yeon/web exec vitest run src/features/card-service/card-deck-format.test.ts src/features/card-service/components/card-markdown-copy-utils.test.ts`, `pnpm --filter @yeon/ui typecheck`, `pnpm --filter @yeon/ui lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/mobile typecheck`, `pnpm --filter @yeon/mobile lint`, `pnpm verify:parity`, `bash bin/verify-ssot.sh --project-only`, `git diff --check` 통과.
