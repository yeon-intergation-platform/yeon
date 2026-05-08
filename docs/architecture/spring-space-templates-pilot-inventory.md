# Spring Space Templates Pilot Inventory

## 문서 목적
- `space-templates`를 Spring 첫 파일럿 도메인으로 옮기기 전에
  현재 Next 구현의 **route / service / DB / contract** 경계를 한 번에 보이게 정리한다.
- 이번 문서는 구현 문서가 아니라 **inventory SSOT**다.

## 파일럿 1차 범위
- 포함:
  - `GET /api/v1/space-templates`
  - `GET /api/v1/space-templates/{templateId}`
- 제외:
  - `POST /api/v1/space-templates`
  - `PATCH /api/v1/space-templates/{templateId}`
  - `DELETE /api/v1/space-templates/{templateId}`
  - `POST /api/v1/space-templates/{templateId}/duplicate`
  - `POST /api/v1/spaces/{spaceId}/apply-template`
  - `POST /api/v1/spaces/{spaceId}/snapshot-template`

## 현재 route inventory

| 분류 | Route | 파일 | 현재 service 호출 | 파일럿 1차 포함 |
|---|---|---|---|---|
| list | `GET /api/v1/space-templates` | `apps/web/src/app/api/v1/space-templates/route.ts` | `seedSystemTemplates`, `listTemplates`, `summarizeSpaceTemplate` | 예 |
| create | `POST /api/v1/space-templates` | `apps/web/src/app/api/v1/space-templates/route.ts` | `createTemplate`, `summarizeSpaceTemplate` | 아니오 |
| detail | `GET /api/v1/space-templates/{templateId}` | `apps/web/src/app/api/v1/space-templates/[templateId]/route.ts` | `getTemplateForUser`, `detailSpaceTemplate` | 예 |
| update | `PATCH /api/v1/space-templates/{templateId}` | `apps/web/src/app/api/v1/space-templates/[templateId]/route.ts` | `updateTemplate`, `summarizeSpaceTemplate` | 아니오 |
| delete | `DELETE /api/v1/space-templates/{templateId}` | `apps/web/src/app/api/v1/space-templates/[templateId]/route.ts` | `deleteTemplate` | 아니오 |
| duplicate | `POST /api/v1/space-templates/{templateId}/duplicate` | `apps/web/src/app/api/v1/space-templates/[templateId]/duplicate/route.ts` | `duplicateTemplate`, `summarizeSpaceTemplate` | 아니오 |
| apply | `POST /api/v1/spaces/{spaceId}/apply-template` | `apps/web/src/app/api/v1/spaces/[spaceId]/apply-template/route.ts` | `applyTemplateToSpace` | 아니오 |
| snapshot | `POST /api/v1/spaces/{spaceId}/snapshot-template` | `apps/web/src/app/api/v1/spaces/[spaceId]/snapshot-template/route.ts` | `snapshotSpaceAsTemplate`, `summarizeSpaceTemplate` | 아니오 |

## 현재 인증/공통 경계
- 모든 route는 현재 Next route layer에서
  `requireAuthenticatedUser`를 호출한다.
- 공통 에러 응답은 `jsonError`를 사용한다.
- 따라서 1차 cutover는 아래 두 레이어로 나뉜다.
  1. **Spring backend**
     - 실제 목록/상세 조회 source of truth
  2. **Next BFF route**
     - 기존 쿠키/세션 기반 인증 유지
     - Spring 호출 결과를 기존 응답 shape로 중계

## 현재 service inventory

핵심 파일:
- `apps/web/src/server/services/space-templates-service.ts`

관찰 포인트:
- 파일 길이: 약 `812` lines
- 한 파일 안에
  - 요약/상세 DTO 변환
  - 시스템 템플릿 seed
  - 생성/수정/삭제
  - snapshot/apply
  - tab/field 삽입 로직
  가 함께 들어있다.

### export 함수 inventory

| 함수 | 역할 | 1차 이전 포함 |
|---|---|---|
| `summarizeSpaceTemplate` | 목록 응답 요약 DTO 생성 | 예 |
| `detailSpaceTemplate` | 상세 응답 DTO 생성 | 예 |
| `seedSystemTemplates` | 시스템 템플릿 정리/seed 진입점 | 조건부 |
| `listTemplates` | 사용자 템플릿 목록 조회 | 예 |
| `getTemplateForUser` | 단일 템플릿 접근 제어 포함 조회 | 예 |
| `createTemplate` | 사용자 템플릿 생성 | 아니오 |
| `updateTemplate` | 사용자 템플릿 수정 | 아니오 |
| `deleteTemplate` | 사용자 템플릿 삭제 | 아니오 |
| `duplicateTemplate` | 템플릿 복제 | 아니오 |
| `snapshotSpaceAsTemplate` | 현재 스페이스를 템플릿으로 저장 | 아니오 |
| `applyTemplateToSpace` | 템플릿을 스페이스 구조에 반영 | 아니오 |

## 1차 이전 시 Spring으로 옮길 최소 서비스 책임

### 포함
1. 템플릿 목록 조회
2. 템플릿 단건 조회
3. 사용자 접근 제어
   - 시스템 템플릿 또는 본인 생성 템플릿만 접근 허용
4. summary/detail DTO 생성

### 제외
1. 시스템 템플릿 write/seed 재설계
2. 템플릿 생성/수정/삭제
3. duplicate
4. snapshot
5. apply-template
6. 스페이스 탭/필드 생성 부작용

## 현재 DB inventory

### 직접 핵심 테이블

| 테이블 | 스키마 파일 | 역할 | 1차 읽기 포함 |
|---|---|---|---|
| `space_templates` | `apps/web/src/server/db/schema/space-templates.ts` | 템플릿 원본 저장. `tabs_config` JSONB 포함 | 예 |

### 2차 이후 연관 테이블

| 테이블 | 스키마 파일 | 현재 쓰이는 이유 | 1차 읽기 포함 |
|---|---|---|---|
| `member_tab_definitions` | `apps/web/src/server/db/schema/member-tabs.ts` | snapshot/apply 시 스페이스 탭 구조 읽기/쓰기 | 아니오 |
| `member_field_definitions` | `apps/web/src/server/db/schema/member-fields.ts` | snapshot/apply 시 필드 구조 읽기/쓰기 | 아니오 |

## `space_templates`에서 1차로 읽어야 하는 컬럼
- `public_id`
- `created_by_user_id`
- `name`
- `description`
- `is_system`
- `tabs_config`
- `created_at`
- `updated_at`

## 현재 응답 shape inventory

### 목록 응답
- route:
  - `GET /api/v1/space-templates`
- shape:
  - `{ templates: SpaceTemplateSummary[] }`

`SpaceTemplateSummary`
- `id`
- `name`
- `description`
- `isSystem`
- `tabCount`
- `fieldCount`
- `tabPreviewNames`
- `fieldPreviewNames`
- `createdAt`
- `updatedAt`

### 상세 응답
- route:
  - `GET /api/v1/space-templates/{templateId}`
- shape:
  - `{ template: SpaceTemplateDetail }`

`SpaceTemplateDetail`
- `SpaceTemplateSummary` 전체
- `tabsConfig`

## 1차 cutover target

### Spring backend가 새로 소유할 것
- `GET /space-templates`
- `GET /space-templates/{templateId}`
- read 전용 query/service/repository
- DTO 매핑

### Next BFF가 당분간 유지할 것
- 인증 확인
- 세션/쿠키 source of truth
- 기존 프론트 route path 유지
- Spring backend 호출 실패 시 route-level error translation

## 위험 포인트
1. `seedSystemTemplates`의 정확한 운영 의미를 write 없이 어떻게 유지할지 추가 결정 필요
2. `tabs_config` JSONB를 Spring DTO/JPA에서 어떻게 파싱할지 기술 선택 필요
3. 시스템 템플릿 + 사용자 템플릿 접근 규칙을 Next와 Spring에서 다르게 구현하면 회귀 위험
4. write route와 read route를 같은 service 파일에서 함께 사용 중이라 분리 계획 필요

## 다음 1작업 추천
- 다음엔
  **Spring side read DTO / controller / repository package plan 문서 1개**
  만 만들고 멈춘다.
