# spring member-fields overview bootstrap pilot

## 차수 1

### 작업내용
- `GET /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`에 남아 있는 Next legacy `overview` lazy backfill을 별도 Spring bootstrap lane으로 분리한다.
- 대상 legacy:
  - `getOverviewTab(spaceId)`
  - `createDefaultOverviewFields(spaceInternalId, overviewTab.id, currentUser.id)`
- 목표는 Next route에서 위 직접 서비스 호출을 제거하고, Spring internal bootstrap endpoint 호출 뒤 기존 Spring read endpoint를 호출하는 thin BFF로 축소하는 것이다.

### 논의 필요
- bootstrap endpoint를 `tabId` 기준으로 둘지, `overview` system key를 내부에서 재판단할지 결정 필요
- 1차에서 missing overview tab row를 생성하지 않을지 여부

### 선택지
1. `POST /spaces/{spaceId}/member-tabs/{tabId}/bootstrap-overview-fields`
2. `POST /spaces/{spaceId}/member-tabs/bootstrap-overview-fields?tabId=...`
3. read endpoint 내부에 side effect를 다시 섞기

### 추천
- **1번 추천**
- 이유:
  - 현재 남은 legacy는 read가 아니라 bootstrap/write 성격이다.
  - read endpoint에 side effect를 섞지 않고 분리해야 source of truth와 실패 경계가 선명하다.
  - Next는 overview 탭일 때만 bootstrap endpoint를 호출하고, 그 뒤 기존 Spring read들을 호출하는 순서로 줄일 수 있다.

### 사용자 방향
- 추천 기준으로 진행

## 차수 2

### 작업내용
- Spring bootstrap lane inventory/package/api contract 문서화
- bootstrap repo/service/controller test 전략 고정

### 논의 필요
- `DEFAULT_OVERVIEW_FIELDS` source of truth를 그대로 web shared 상수로 유지할지, backend로 복제/이관할지

### 선택지
1. web shared 상수를 backend에서도 재사용 가능하도록 shared package로 이동
2. backend에 Spring 전용 상수로 복제

### 추천
- **2번 추천**
- 이유:
  - 현재 Spring runtime은 TypeScript shared 모듈을 직접 재사용할 수 없다.
  - 1차는 backend 전용 상수로 최소 이식하고, 이후 shared SSOT 정리 lane을 별도로 여는 편이 안전하다.

### 사용자 방향
- 추천 기준으로 진행

## 차수 3

### 작업내용
- Spring bootstrap endpoint 구현
- Next route GET에서 direct overview backfill 제거
- backend/web/runtime smoke로 실제 제거와 연동 확인

### 논의 필요
- idempotent 호출 보장 범위를 `on conflict do nothing` 수준으로 둘지 여부

### 선택지
1. `on conflict do nothing` 기반 idempotent
2. 존재 여부 조회 후 insert

### 추천
- **1번 추천**
- 이유:
  - 현재 Next legacy도 본질적으로 중복 생성 방지 + 기본값 삽입만 필요하다.
  - concurrent 호출에서 race를 줄이려면 insert 쪽 idempotency가 더 단순하다.

### 사용자 방향
- 추천 기준으로 진행
