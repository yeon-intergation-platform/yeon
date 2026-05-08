# Spring Google Sheets Integration Boundary

## 작업내용
- `google-sheets-export-service.ts` 전체를 Spring 분리 관점에서 inventory하고, 가장 작은 다음 extraction lane을 고정한다.
- export row builder, import coordinator, snapshot 관리, Google API 호출 경계를 분리해 본다.

## 논의 필요
- 다음 extraction을 export read 쪽으로 먼저 할지, import coordinator 쪽으로 먼저 할지
- Google OAuth token 획득은 계속 Next auth/session에 둘지
- snapshot persistence를 Spring으로 옮길 때 export와 import를 같이 묶을지

## 선택지
- 선택지 A: `buildSpaceExportRows` read lane부터 Spring으로 뺀다.
- 선택지 B: import coordinator 전체를 Spring으로 뺀다.
- 선택지 C: Google API 호출 layer부터 Spring으로 뺀다.

## 추천
- **선택지 A**
- 이유: 현재 route/service direct field-values 의존은 이미 제거되었고, 가장 큰 남은 source of truth는 export row builder의 member/field/value 조합 read다. 이 부분은 외부 OAuth 호출과 충돌하지 않고 read-only라 가장 안전하게 잘라낼 수 있다.

## 사용자 방향
- 추천 기준으로 진행
