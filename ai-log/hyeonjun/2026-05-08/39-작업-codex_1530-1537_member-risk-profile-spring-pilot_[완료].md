# 39차 작업 — member-risk-profile spring pilot

- 시작: 15:30
- 종료: 15:37
- 상태: 완료

## 목표
- member route layer에 남아 있는 risk profile direct Next backend logic을 제거하고 Spring으로 이관한다.

## 작업내용
- Spring `member_risk_profiles` package를 추가했다.
  - controller / dto / repository / service / tests
- `POST /member-risk-profiles` bulk endpoint를 추가했다.
- Next member routes를 Spring risk profile endpoint 기반으로 전환했다.
- route tests를 갱신했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.member_risk_profiles.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/members/[memberId]/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/members/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/members/[memberId]/route.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/members/route.ts`
  기준
  - `member-risk-service`
  - `getMemberRiskProfile`
  - `attachMemberRiskProfiles`
  - no matches ✅

## 남은 것
- repo-wide Next backend full migration 목표는 계속 미완료다.
- 다음 smallest lane은 `typing-decks` 또는 `card-decks` 본체 또는 `googledrive/onedrive` 재고정이 필요하다.
