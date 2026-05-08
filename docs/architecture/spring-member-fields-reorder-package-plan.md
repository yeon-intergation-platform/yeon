# Spring Member Fields Reorder Package Plan

## 문서 목적
- `member-fields` bulk mutation 중 **reorder lane만 먼저** Spring으로 옮기기 위한 내부 구조를 고정한다.

## 1차 reorder 파일럿 범위
- Spring backend API
  - `PATCH /spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`
- Next BFF API
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`

## 설계 원칙
1. reorder만 먼저 옮긴다.
2. create/update/delete lane와 분리 유지한다.
3. reorder는 bulk mutation이므로 **transaction 경계**를 service에 명시한다.
4. 1차에서는 Next 현재 동작과 최대한 동일하게 간다.
5. 인증 source of truth는 계속 Next에 둔다.

## 추천 패키지 구조
- root:
  - `world.yeon.backend.member_fields.reorder`
- 1차 생성 패키지:
  - `reorder.controller`
  - `reorder.service`
  - `reorder.repository`
  - `reorder.dto`

## Next BFF ↔ Spring 호출 계획
- Next route 내부 구현만
  - `reorderFields(...)` 직접 호출
  - → Spring backend fetch
  로 교체
- 내부 hop header:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
