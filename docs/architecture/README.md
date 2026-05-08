# Architecture

시스템 구조, 앱/패키지 경계, 라우트 소유권을 관리합니다.

- `system-overview.md` — 전체 시스템 구조
- `platform-route-ownership.md` — 플랫폼 라우트 소유권과 접근 정책
- `spring-backend-bootstrap-boundary.md` — `apps/backend` 시작 위치와 초기 역할 경계
- `spring-backend-core-runtime-tech-stack.md` — Spring bootstrap app 코어 런타임 SSOT
- `spring-backend-jdk-gradle-ratification.md` — Spring bootstrap toolchain baseline SSOT
- `spring-backend-bootstrap-preflight-checklist.md` — Spring bootstrap 생성 직전 점검표
- `spring-backend-initializr-spec.md` — Spring Initializr 생성 입력값 SSOT
- `spring-backend-starter-adoption-plan.md` — 초기 제외 starter의 단계별 도입 계획
- `spring-backend-jdbc-baseline.md` — JDBC profile 기반 datasource baseline
- `spring-backend-flyway-baseline.md` — Spring 전용 schema Flyway baseline
- `spring-backend-jpa-baseline.md` — 더미 entity/repository 기반 JPA baseline
- `spring-backend-testcontainers-baseline.md` — 로컬 DB 독립형 persistence smoke baseline
- `spring-space-templates-pilot-inventory.md` — 첫 파일럿 도메인(space-templates)의 route/service/DB inventory
- `spring-space-templates-read-package-plan.md` — 첫 파일럿 read-only Spring 패키지/계층 설계
- `spring-space-templates-read-api-contract.md` — 첫 파일럿 read-only Next BFF ↔ Spring 내부 계약 초안
- `spring-space-templates-read-skeleton-file-plan.md` — 첫 파일럿 read-only 구현 턴별 파일 생성 계획
- `spring-member-tabs-read-pilot-inventory.md` — 다음 파일럿(member-tabs read)의 route/service/DB/consumer inventory
- `spring-member-tabs-read-package-plan.md` — 다음 파일럿(member-tabs read)의 Spring 패키지/계층 설계
- `spring-member-tabs-read-api-contract.md` — 다음 파일럿(member-tabs read)의 Next BFF ↔ Spring 내부 계약 초안
- `spring-member-tabs-read-skeleton-file-plan.md` — 다음 파일럿(member-tabs read)의 구현 턴별 파일 생성 계획
- `spring-member-tabs-write-pilot-inventory.md` — 다음 파일럿(member-tabs write)의 route/service/mutation inventory
- `spring-member-tabs-write-package-plan.md` — 다음 파일럿(member-tabs write)의 Spring 패키지/계층 설계
- `spring-member-tabs-write-api-contract.md` — 다음 파일럿(member-tabs write)의 Next BFF ↔ Spring 내부 계약 초안
- `spring-member-tabs-write-skeleton-file-plan.md` — 다음 파일럿(member-tabs write)의 구현 턴별 파일 생성 계획

- `spring-member-tabs-reorder-reset-pilot-inventory.md` — 다음 파일럿(member-tabs reorder/reset)의 route/service/mutation inventory

- `spring-member-tabs-reorder-package-plan.md` — 다음 파일럿(member-tabs reorder)의 Spring 패키지/계층 설계

- `spring-member-tabs-reorder-api-contract.md` — 다음 파일럿(member-tabs reorder)의 Next BFF ↔ Spring 내부 계약 초안

- `spring-member-tabs-reorder-skeleton-file-plan.md` — 다음 파일럿(member-tabs reorder)의 구현 턴별 파일 생성 계획

- `spring-member-tabs-reset-package-plan.md` — 다음 파일럿(member-tabs reset)의 Spring 패키지/계층 설계

- `spring-member-tabs-reset-api-contract.md` — 다음 파일럿(member-tabs reset)의 Next BFF ↔ Spring 내부 계약 초안

- `spring-member-tabs-reset-skeleton-file-plan.md` — 다음 파일럿(member-tabs reset)의 구현 턴별 파일 생성 계획

- `spring-member-fields-read-pilot-inventory.md` — member-fields read 다음 Spring 파일럿의 현재 Next route/service/부작용 inventory.

- `spring-member-fields-read-package-plan.md` — member-fields read 1차 Spring 패키지/계층/호출 경계 설계.

- `spring-member-fields-read-api-contract.md` — member-fields read 1차 outward/internal API 계약과 error shape.

- `spring-member-fields-read-skeleton-file-plan.md` — member-fields read 1차의 file/write set과 차수 분할 계획.

- `spring-member-field-values-read-pilot-inventory.md` — fields GET의 남은 `memberId` values legacy branch inventory.

- `spring-member-field-values-read-package-plan.md` — member field values read 1차 Spring 패키지/계층 설계.

- `spring-member-field-values-read-api-contract.md` — member field values read 내부 계약과 Next 조합 규칙.

- `spring-member-fields-overview-bootstrap-pilot-inventory.md` — member-fields GET에 남은 overview lazy backfill legacy inventory.

- `spring-member-fields-overview-bootstrap-package-plan.md` — overview default field bootstrap Spring 패키지/계층 설계.

- `spring-member-fields-overview-bootstrap-api-contract.md` — overview bootstrap internal endpoint와 Next BFF 호출 규칙.

- `spring-member-fields-write-pilot-inventory.md` — member-fields create/update/delete/reorder 현재 Next mutation inventory.

- `spring-member-fields-write-package-plan.md` — member-fields CRUD write Spring 패키지/계층 설계.

- `spring-member-fields-write-api-contract.md` — member-fields CRUD write 내부 계약과 Next translation 규칙.

- `spring-member-fields-write-skeleton-file-plan.md` — member-fields CRUD write 구현 차수와 write set 계획.

- `spring-member-fields-reorder-pilot-inventory.md` — member-fields reorder lane의 현재 Next route/service/mutation inventory.

- `spring-member-fields-reorder-package-plan.md` — member-fields reorder Spring 패키지/계층 설계.

- `spring-member-fields-reorder-api-contract.md` — member-fields reorder 내부 계약과 Next translation 규칙.

- `spring-member-fields-reorder-skeleton-file-plan.md` — member-fields reorder 구현 차수와 write set 계획.

- `spring-member-field-values-write-pilot-inventory.md` — member-field-values write lane의 현재 Next route/service/consumer inventory.

- `spring-member-field-values-write-package-plan.md` — member-field-values write Spring 패키지/계층 설계.

- `spring-member-field-values-write-api-contract.md` — member-field-values write 내부 계약과 Next translation 규칙.

- `spring-member-field-values-write-skeleton-file-plan.md` — member-field-values write 구현 차수와 write set 계획.


- `spring-member-field-values-route-read-pilot-inventory.md` — members route field-values GET의 현재 Next direct read inventory.

- `spring-member-field-values-route-read-api-contract.md` — members route field-values GET 내부 계약과 Next translation 규칙.


- `spring-google-sheets-field-values-pilot-inventory.md` — google-sheets export/import service에 남은 field-values direct 의존 inventory.


- `spring-google-sheets-integration-boundary-inventory.md` — google-sheets integration service의 남은 Next ownership과 extraction 순서 inventory.

- `spring-google-sheets-export-read-package-plan.md` — google-sheets 다음 extraction lane인 export row builder Spring read 패키지/계층 설계.


- `spring-google-sheets-export-read-api-contract.md` — google-sheets export row builder 내부 API 계약과 Next translation 규칙.

- `spring-google-sheets-export-read-skeleton-file-plan.md` — google-sheets export row builder extraction 구현 차수와 write set 계획.

- `spring-google-sheets-snapshot-package-plan.md` — google-sheets snapshot read/write Spring 패키지/계층 설계.

- `spring-google-sheets-snapshot-api-contract.md` — google-sheets snapshot internal API 계약과 Next translation 규칙.

- `spring-google-sheets-snapshot-skeleton-file-plan.md` — google-sheets snapshot extraction 구현 차수와 write set 계획.

- `spring-google-sheets-import-context-package-plan.md` — google-sheets import context read Spring 패키지/계층 설계.

- `spring-google-sheets-import-context-api-contract.md` — google-sheets import context internal API 계약과 Next translation 규칙.

- `spring-google-sheets-import-context-skeleton-file-plan.md` — google-sheets import context extraction 구현 차수와 write set 계획.

- `spring-google-sheets-import-evaluation-package-plan.md` — google-sheets import evaluation Spring 패키지/계층 설계.

- `spring-google-sheets-import-evaluation-api-contract.md` — google-sheets import evaluation internal API 계약과 Next translation 규칙.

- `spring-google-sheets-import-evaluation-skeleton-file-plan.md` — google-sheets import evaluation extraction 구현 차수와 write set 계획.

- `spring-google-sheets-import-mutation-package-plan.md` — google-sheets import mutation Spring 패키지/계층 설계.

- `spring-google-sheets-import-mutation-api-contract.md` — google-sheets import mutation internal API 계약과 Next translation 규칙.

- `spring-google-sheets-import-mutation-skeleton-file-plan.md` — google-sheets import mutation extraction 구현 차수와 write set 계획.

- `spring-google-sheets-export-sync-package-plan.md` — google-sheets export sync finalize Spring 패키지/계층 설계.

- `spring-google-sheets-export-sync-api-contract.md` — google-sheets export sync finalize internal API 계약과 Next translation 규칙.

- `spring-google-sheets-export-sync-skeleton-file-plan.md` — google-sheets export sync finalize extraction 구현 차수와 write set 계획.

- `spring-google-sheets-export-run-package-plan.md` — google-sheets export transport Spring 패키지/계층 설계.

- `spring-google-sheets-export-run-api-contract.md` — google-sheets export transport internal API 계약과 Next translation 규칙.

- `spring-google-sheets-export-run-skeleton-file-plan.md` — google-sheets export transport extraction 구현 차수와 write set 계획.

- `spring-google-sheets-import-run-package-plan.md` — google-sheets import transport/orchestration Spring 패키지/계층 설계.

- `spring-google-sheets-import-run-api-contract.md` — google-sheets import transport/orchestration internal API 계약과 Next translation 규칙.

- `spring-google-sheets-import-run-skeleton-file-plan.md` — google-sheets import transport/orchestration extraction 구현 차수와 write set 계획.

- `spring-google-sheets-export-integration-route-package-plan.md` — sheet-export integration CRUD Spring 패키지/계층 설계.

- `spring-google-sheets-export-integration-route-api-contract.md` — sheet-export integration CRUD internal API 계약.

- `spring-google-sheets-export-integration-route-skeleton-file-plan.md` — sheet-export integration CRUD extraction 구현 차수와 write set 계획.
- `spring-google-sheets-legacy-sync-package-plan.md` — legacy sheet-integrations/activity sync Spring 패키지 경계.
- `spring-google-sheets-legacy-sync-api-contract.md` — legacy sheet-integrations/activity sync internal API 계약.
- `spring-google-sheets-legacy-sync-skeleton-file-plan.md` — legacy sheet-integrations/activity sync extraction 구현 차수와 write set 계획.
- `spring-next-backend-full-migration-inventory.md` — repo-wide Next backend 잔존 surface inventory와 다음 우선순위.
- `spring-members-crud-package-plan.md` — members CRUD Spring 패키지 경계.
- `spring-members-crud-api-contract.md` — members CRUD internal API 계약.
- `spring-members-crud-skeleton-file-plan.md` — members CRUD extraction 구현 차수와 write set 계획.
- `spring-googledrive-browser-package-plan.md` — googledrive browser/status read Spring 패키지 경계.
- `spring-googledrive-browser-api-contract.md` — googledrive browser/status internal API 계약.
- `spring-googledrive-browser-skeleton-file-plan.md` — googledrive browser/status extraction 구현 차수와 write set 계획.
- `spring-onedrive-browser-package-plan.md` — onedrive browser/status read Spring 패키지 경계.
- `spring-onedrive-browser-api-contract.md` — onedrive browser/status internal API 계약.
- `spring-onedrive-browser-skeleton-file-plan.md` — onedrive browser/status extraction 구현 차수와 write set 계획.
- `spring-cloud-analyze-transport-pilot.md` — cloud analyze route transport를 Spring browser endpoint로 전환한 차수 메모.
- `spring-cloud-oauth-route-pilot.md` — cloud auth start/callback route를 Spring internal endpoint로 전환한 차수 메모.
- `spring-counseling-record-students-pilot.md` — counseling 학생 요약 read route를 Spring으로 전환한 차수 메모.
- `spring-member-counseling-records-pilot.md` — member counseling-records list read route를 Spring으로 전환한 차수 메모.
