# Spring space-templates POST 이전 백로그

## 차수 1
- 작업내용: `POST /api/v1/space-templates`를 Spring internal contract로 이전하고 Next route의 기존 `createTemplate` 직접 호출을 제거한다.
- 논의 필요: create payload validation을 Next와 Spring 양쪽에서 유지할지 여부
- 선택지:
  - A. Next zod + Spring validation 동시 유지
  - B. Next는 최소 JSON guard만 두고 Spring validation을 source of truth로 승격
- 추천: B. migration 목표가 Spring source of truth 전환이므로 create validation도 Spring 쪽으로 집중시키는 편이 더 일관적이다.
- 사용자 방향: B

## 차수 2
- 작업내용: backend create service/controller 테스트, web route translation 테스트, runtime smoke evidence를 남긴다.
- 논의 필요: runtime smoke를 backend direct 기준으로 충분히 볼지 여부
- 선택지:
  - A. Spring direct POST smoke + web route unit/build verification
  - B. Next authenticated runtime POST smoke까지 강행
- 추천: A. 현 시점에는 outward auth가 Next 세션에 묶여 있으므로 backend direct smoke와 web route 검증을 묶는 것이 가장 안정적이다.
- 사용자 방향: A
