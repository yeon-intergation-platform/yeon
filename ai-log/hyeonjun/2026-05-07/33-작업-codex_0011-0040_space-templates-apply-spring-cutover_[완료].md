# space-templates apply spring cutover

- 작업 목표: apply-template 경로를 Spring backend로 이전하고 Next route의 기존 applyTemplateToSpace 직접 호출을 제거한 뒤 연동 검증까지 완료
- 작업 범위: backend apply endpoint/service/repository, web spring client/route cutover, 테스트/verify, 필요시 runtime smoke
- 기준: Next는 outward auth/BFF 유지, Spring은 template apply source of truth 담당
- 비목표: auth migration

## 재발방지 메모

- 매 Ralph 반복에는 반드시 `Spring 이전 -> Next 기존 구현 제거/축소 -> 연동 검증` 세트가 함께 들어가야 한다.


## 구현 결과

- Spring backend에 `POST /spaces/{spaceId}/apply-template` endpoint를 추가했다.
- Next route `apps/web/src/app/api/v1/spaces/[spaceId]/apply-template/route.ts`는 기존 `applyTemplateToSpace` 직접 호출을 제거하고 Spring client 호출만 남겼다.
- internal token bridge를 `/actuator` 외 application route 전반에 적용해 `/spaces/*` 경로도 동일하게 인증 우회되도록 보강했다.

## 검증 증거

- `cd apps/backend && ./gradlew test`
  - 결과: `BUILD SUCCESSFUL`
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/apply-template/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/snapshot-template/__tests__/route.test.ts' 'src/app/api/v1/space-templates/__tests__/route.test.ts' 'src/app/api/v1/space-templates/[templateId]/__tests__/route.test.ts' 'src/app/api/v1/space-templates/[templateId]/duplicate/__tests__/route.test.ts'`
  - 결과: `5 passed / 14 passed`
- `pnpm --filter @yeon/web typecheck`
  - 결과: 통과
- `pnpm --filter @yeon/web build`
  - 결과: 통과
- `git diff --check -- apps/backend apps/web docs/product/backlog .omx/notepad.md ai-log/hyeonjun/2026-05-07/33-작업-codex_0011-0040_space-templates-apply-spring-cutover_[완료].md`
  - 결과: 통과
- `bash bin/sync-skills.sh --check`
  - 결과: 통과
- `bash bin/verify-ssot.sh --project-only`
  - 결과: 통과

## runtime smoke

- backend 실행 조건
  - `JAVA_HOME=/home/linuxbrew/.linuxbrew/opt/openjdk`
  - `SPRING_PROFILES_ACTIVE=jdbc`
  - `SERVER_PORT=18082`
  - `SPRING_INTERNAL_TOKEN=runtime-smoke-token`
- fixture
  - `public.users` + `yeon_backend.users` 동일 user row 생성
  - `public.spaces`에 target space 생성
  - 기존 system/custom tab + field fixture 생성
- Spring direct API 결과
  - `POST /space-templates` → `201`
  - `POST /spaces/space_apply_smoke/apply-template` → `200` / `{"ok":true}`
- DB 검증 결과
  - tabs
    - `overview` system tab → 이름 `새 개요`, `display_order = 3`
    - custom tab → 이름 `상담 메모`, `display_order = 7`
  - fields
    - `새 개요` tab 아래 `상태(select, required=true)` 1개
    - `상담 메모` tab 아래 `메모(text)` 1개
  - cleanup 이후 잔존 row 확인: `0|0|0|0`
    - template / space / public user / backend user 모두 0

## 재발방지 메모

- Java 25 toolchain 프로젝트에서 `bootRun` runtime smoke는 **명시적 `JAVA_HOME`** 없으면 새 셸에서 실패할 수 있다.
- runtime smoke 포트는 `8081/8082` 같은 흔한 값보다 **충돌 가능성 낮은 높은 포트**를 우선한다.
- Spring create 응답 shape는 top-level `id`가 아니라 **`template.id`** 이다. smoke 스크립트에서 응답 shape를 먼저 확인해야 한다.
- Spring이 `yeon_backend.space_templates.created_by_user_id` FK를 쓰는 동안, snapshot/apply/create smoke는 **`public.users`와 `yeon_backend.users`를 동시에 fixture**로 준비해야 한다.
