# Spring Google Sheets Export Integration Route Pilot

## 작업내용
- Next `sheet-export/route.ts`에 남아 있는 export integration CRUD/lookup DB 로직을 Spring internal API로 이동한다.
- 이번 차수는 export integration GET/PUT/DELETE만 옮기고, import/sync route의 integration lookup은 다음 점검 차수에서 이어간다.

## 논의 필요
- create/update를 PUT upsert 하나로 통일할지
- 응답 shape를 기존 Drizzle row와 얼마나 동일하게 유지할지
- `extractSheetId` 검증 책임을 Spring service로 옮길지

## 선택지
- 선택지 A: `/sheet-export/integration` GET/PUT/DELETE endpoint로 통일한다.
- 선택지 B: create/update를 별도 endpoint로 나눈다.
- 선택지 C: sheet-integrations legacy flow까지 한 번에 같이 옮긴다.

## 추천
- **선택지 A**
- 이유: 현재 Next route에서 실제 책임은 export integration 단일 리소스 관리다. upsert형 PUT이 가장 작은 cutover다.

## 사용자 방향
- 추천 기준으로 진행
