# member-tabs write spring pilot

- 작업 목표: `member-tabs` write lane(create/update/delete 우선)를 다음 Spring 파일럿으로 열고 backlog/inventory부터 시작
- 작업 범위: backlog, inventory, 이후 write package plan / contract / skeleton 설계
- 기준: Next는 outward auth/BFF 유지, Spring은 member-tabs write source of truth 담당
- 비목표: fields/auth migration, reorder/reset 동시 이전

## 재발방지 메모

- 매 Ralph 반복에는 반드시 `Spring 이전 -> Next 기존 구현 제거/축소 -> 연동 검증` 세트가 함께 들어가야 한다.

- `docs/architecture/spring-member-tabs-write-package-plan.md`로 create/update/delete write lane 계층 구조를 고정했다.

- `docs/architecture/spring-member-tabs-write-api-contract.md`로 create/update/delete internal endpoint/header/error/translation 계약을 고정했다.

- `docs/architecture/spring-member-tabs-write-skeleton-file-plan.md`로 dto/repository → service → controller → Next cutover 순서를 고정했다.

- 차수 A 구현 시작: write dto 4개와 `MemberTabWriteRepository`, repository integration test를 추가했다. save/delete 경로를 위해 `MemberTabDefinitionEntity`에 최소 setter를 보강했다.

- 차수 B 구현 시작: `MemberTabWriteService`와 service unit test를 추가해 create/update/delete 규칙(source of truth)을 Spring으로 옮겼다.

- 차수 C 구현 시작: `MemberTabWriteController`와 controller slice test를 추가해 Spring internal create/update/delete surface를 열었다.

- 차수 D 구현 시작: Next `member-tabs` POST/PATCH/DELETE route에서 기존 direct service 호출을 제거하고 Spring client fetch로 전환했다.
