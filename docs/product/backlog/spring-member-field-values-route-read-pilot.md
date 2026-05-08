# Spring Member Field Values Route Read Pilot

## 작업내용
- `GET /api/v1/spaces/{spaceId}/members/{memberId}/field-values`를 Spring source of truth로 옮긴다.
- 1차 범위는 space/member 기준 field value read와 optional `fieldDefinitionId` filter를 Spring 내부 GET으로 이전하는 것이다.

## 논의 필요
- tab 기준 endpoint와 member route endpoint를 분리 유지할지
- response에 `fieldType`, `fieldName` 메타데이터를 계속 포함할지
- google-sheets export 같은 내부 service 소비자 direct read는 언제 옮길지

## 선택지
- 선택지 A: member route GET만 먼저 Spring으로 옮긴다.
- 선택지 B: member route GET과 내부 service 소비자까지 한 번에 옮긴다.
- 선택지 C: tab 기준 values read와 member route read를 재통합 설계한다.

## 추천
- **선택지 A**
- 이유: outward route direct 로직 제거를 먼저 달성하고, 내부 service 소비자 정리는 다음 lane으로 분리하는 편이 검증과 rollback이 쉽다.

## 사용자 방향
- 추천 기준으로 진행
