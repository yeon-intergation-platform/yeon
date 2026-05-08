# 31차 작업 — home-insight-banner spring pilot

- 시작: 14:16
- 종료: 14:19
- 상태: 완료

## 목표
- home insight banner dismiss read/write를 Spring으로 이동한다.

## 작업내용
- backend `home_insight_banners` package를 추가했다.
- Next route를 Spring thin BFF로 전환했다.
- route cutover 뒤 production consumer가 사라진 `home-insight-banner-service.ts`와 관련 test도 제거했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.home_insight_banners.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/home/insight-banners/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- `apps/web/src/app/api/v1/home/insight-banners/**` 기준 `home-insight-banner-service` no matches ✅
- `apps/web/src/server/services/home-insight-banner-service.ts` 삭제 완료 ✅
