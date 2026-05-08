# member-tabs read spring pilot

- 작업 목표: `GET /api/v1/spaces/{spaceId}/member-tabs`를 다음 Spring read 파일럿으로 선정하고 inventory/backlog부터 시작
- 작업 범위: backlog, inventory, 이후 read-only cutover 설계
- 기준: Next는 outward auth/BFF 유지, Spring은 public member tab/field read source of truth 담당
- 비목표: write/auth migration

## 재발방지 메모

- 매 Ralph 반복에는 반드시 `Spring 이전 -> Next 기존 구현 제거/축소 -> 연동 검증` 세트가 함께 들어가야 한다.


## 이번 턴 정리

- `member-tabs` read를 다음 Spring 파일럿으로 고정했다.
- 현재 `GET /api/v1/spaces/{spaceId}/member-tabs`는 순수 read가 아니라 시스템 탭 lazy backfill 부작용까지 포함한다는 점을 inventory에 명시했다.
- 1차 추천 방향은 **read endpoint와 backfill write를 분리**하는 것이다.

## 산출물

- `docs/product/backlog/spring-member-tabs-read-pilot.md`
- `docs/architecture/spring-member-tabs-read-pilot-inventory.md`

- `docs/architecture/spring-member-tabs-read-package-plan.md`로 Spring read 계층 구조와 lazy backfill 분리 원칙을 고정했다.
- `docs/architecture/spring-member-tabs-read-api-contract.md`로 internal endpoint/header/error/translation 계약을 고정했다.
- `docs/architecture/spring-member-tabs-read-skeleton-file-plan.md`로 차수 A/B/C write set을 고정했다.

- 차수 A 코드로 `MemberTabDefinitionEntity`, `MemberTabReadRepository`, `MemberTabReadRepositoryTests`를 생성했다.


## 차수 A 구현/검증 결과

- 생성 파일
  - `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/model/MemberTabDefinitionEntity.java`
  - `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/repository/MemberTabReadRepository.java`
  - `apps/backend/src/test/java/world/yeon/backend/member_tabs/read/repository/MemberTabReadRepositoryTests.java`
- 구현 범위
  - `public.member_tab_definitions` JPA entity 매핑
  - `public.spaces.public_id -> id` 해석
  - `space_id` 기준 탭 목록 `display_order asc` 조회
  - lazy backfill/write 없음
- 검증 증거
  - `cd apps/backend && ./gradlew test --tests '*MemberTabReadRepositoryTests'` → 통과
  - `cd apps/backend && ./gradlew test` → 통과
  - `git diff --check -- ...MemberTabDefinitionEntity.java ...MemberTabReadRepository.java ...MemberTabReadRepositoryTests.java ...34-작업...` → 통과
  - `bash bin/sync-skills.sh --check` → 통과
  - `bash bin/verify-ssot.sh --project-only` → 통과
- 재발방지 메모
  - public schema read 파일럿 테스트는 기존 Flyway만으로는 테이블이 없을 수 있으므로, 차수 A에서는 테스트 내부 fixture table 생성으로 원인 분리를 먼저 한다.
  - repository 단계에서는 `SpaceEntity`까지 한 번에 만들지 않고 native lookup + entity read 조합으로 최소 경로를 유지한다.
  - test 출력의 deprecated 경고는 즉시 blocker는 아니지만, 차수 B 이후 필요하면 `-Xlint:deprecation`으로 원인을 좁혀 separate cleanup lane으로 처리한다.
- 차수 B 코드로 `MemberTabItemResponse`, `MemberTabListResponse`, `MemberTabReadMapper`, `MemberTabReadService`, `MemberTabReadServiceTests`를 생성했다.


## 차수 B 구현/검증 결과

- 생성 파일
  - `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/dto/MemberTabItemResponse.java`
  - `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/dto/MemberTabListResponse.java`
  - `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/mapper/MemberTabReadMapper.java`
  - `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/service/MemberTabReadService.java`
  - `apps/backend/src/test/java/world/yeon/backend/member_tabs/read/service/MemberTabReadServiceTests.java`
- 구현 범위
  - entity -> outward item DTO 매핑
  - `{ tabs: [...] }` 응답 shape 고정
  - `space not found` 시 `NoSuchElementException("스페이스를 찾지 못했습니다.")`
  - system tab이 없어도 write/backfill 없이 그대로 결과 반환
- 검증 증거
  - `cd apps/backend && ./gradlew test --tests '*MemberTabReadServiceTests'` → 통과
  - `cd apps/backend && ./gradlew test` → 통과
  - `git diff --check -- ...MemberTabItemResponse.java ...MemberTabListResponse.java ...MemberTabReadMapper.java ...MemberTabReadService.java ...MemberTabReadServiceTests.java ...34-작업...` → 통과
  - `bash bin/sync-skills.sh --check` → 통과
  - `bash bin/verify-ssot.sh --project-only` → 통과
- 재발방지 메모
  - 차수 B service는 owner filter/authorization을 섞지 않고 **space 존재 여부 + repository 결과 전달**까지만 담당해서 책임을 좁힌다.
  - read 파일럿의 mapper는 DB 컬럼 전체를 노출하지 않고 contract에 필요한 필드만 고정해서 drift 범위를 줄인다.
  - 빈 탭 목록은 backfill trigger가 아니라 **정상 결과 케이스**로 먼저 테스트해 둬야 다음 차수에서 lazy init 회귀를 피할 수 있다.
- 차수 C 코드로 `MemberTabReadController`, `MemberTabReadControllerTests`를 생성했다.


## 차수 C 구현/검증 결과

- 생성 파일
  - `apps/backend/src/main/java/world/yeon/backend/member_tabs/read/controller/MemberTabReadController.java`
  - `apps/backend/src/test/java/world/yeon/backend/member_tabs/read/controller/MemberTabReadControllerTests.java`
- 구현 범위
  - `GET /spaces/{spaceId}/member-tabs`
  - `X-Yeon-User-Id` required
  - `NoSuchElementException -> 404 { code: "SPACE_NOT_FOUND", message }`
  - controller 단계에서는 lazy backfill/write 없음
- 검증 증거
  - `cd apps/backend && ./gradlew test --tests '*MemberTabReadControllerTests'` → 통과
  - `cd apps/backend && ./gradlew test` → 통과
  - `git diff --check -- ...MemberTabReadController.java ...MemberTabReadControllerTests.java ...34-작업...` → 통과
  - `bash bin/sync-skills.sh --check` → 통과
  - `bash bin/verify-ssot.sh --project-only` → 통과
- 재발방지 메모
  - controller slice test에서는 internal-token transport 401을 과하게 주장하지 말고, 해당 보안 경계는 `SecurityConfigTests`의 별도 smoke로 커버한다.
  - read controller test의 책임은 header-required, 200/404, response shape로 좁혀야 실패 원인 분리가 쉽다.
- Next `member-tabs` GET route를 Spring fetch로 전환하고 lazy backfill 로직을 제거했다.


## Next GET cutover 구현/검증 결과

- 변경 파일
  - `apps/web/src/server/member-tabs-spring-client.ts`
  - `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/route.ts`
  - `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/__tests__/route.test.ts`
- 구현 범위
  - Next `GET /api/v1/spaces/{spaceId}/member-tabs`를 Spring fetch로 전환
  - 기존 `getTabsForSpace` 직접 호출 제거
  - 기존 lazy backfill (`createDefaultSystemTabs`) 제거
  - POST/write 경로는 그대로 유지
- 검증 증거
  - `cd apps/backend && ./gradlew test` → 통과
  - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/member-tabs/__tests__/route.test.ts'` → 통과
  - `pnpm --filter @yeon/web typecheck` → 통과
  - `pnpm --filter @yeon/web build` → 통과
  - `git diff --check -- apps/web/src/server/member-tabs-spring-client.ts apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/route.ts apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/__tests__/route.test.ts ...34-작업...` → 통과
  - `bash bin/sync-skills.sh --check` → 통과
  - `bash bin/verify-ssot.sh --project-only` → 통과
- Spring direct runtime smoke
  - backend `bootRun` on `18084` with `SPRING_PROFILES_ACTIVE=jdbc`, `SPRING_INTERNAL_TOKEN=runtime-smoke-token`
  - public fixture: user 1명, space 1개, member tabs 3개(system/custom/custom-hidden)
  - `GET /spaces/space_member_tabs_smoke/member-tabs` → `200`
  - 응답 정렬/shape 확인
    - `mtb_system_overview` / `displayOrder 0`
    - `mtb_custom_notes` / `displayOrder 1`
    - `mtb_custom_hidden` / `displayOrder 2`
  - cleanup counts → `0|0|0`
- 재발방지 메모
  - Next GET cutover에서는 write/lazy init을 같이 가져오지 말고, Spring read 결과만 그대로 중계해야 실패 원인 분리가 쉽다.
  - authenticated Next route의 실제 HTTP smoke가 어려운 구간은 `Spring direct runtime smoke + Next route unit test + build/typecheck` 3종 증거 조합으로 닫는다.
