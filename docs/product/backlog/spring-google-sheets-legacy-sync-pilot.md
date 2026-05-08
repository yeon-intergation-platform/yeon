# Spring Google Sheets Legacy Sync Pilot

## 작업내용
- Next `sheet-integrations` route와 `google-sheets-service.ts`에 남아 있는 legacy Google Sheets activity sync 백엔드 로직을 Spring으로 이동한다.
- 이번 차수는 `GET/POST /sheet-integrations`와 `POST /sheet-integrations/{integrationId}/sync`를 thin BFF로 전환하는 데 집중한다.

## 논의 필요
- legacy sheet integration CRUD를 `sheet-export`와 같은 단일 resource가 아니라 list/create + sync 형태로 유지할지
- Google service account credential 파싱과 Google Sheets read transport를 Spring service 안으로 그대로 가져갈지
- route 호환을 위해 기존 응답 shape를 어디까지 그대로 유지할지

## 선택지
- 선택지 A: 기존 route 경로는 유지하고 Spring 내부 endpoint만 추가한다.
- 선택지 B: legacy route를 제거하고 새 경로로 클라이언트까지 같이 바꾼다.
- 선택지 C: legacy sync를 비활성화하고 삭제한다.

## 추천
- **선택지 A**
- 이유: 현재 목표는 Next 백엔드 로직 제거와 migration audit completion이다. 외부 계약 변화 없이 thin BFF로 바꾸는 것이 가장 작고 안전하다.

## 사용자 방향
- 추천 기준으로 진행
