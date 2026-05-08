# Spring space-templates PATCH/DELETE 이전 백로그

## 차수 1
- 작업내용: `PATCH /api/v1/space-templates/{templateId}`, `DELETE /api/v1/space-templates/{templateId}`를 Spring internal contract로 이전하고 Next route의 기존 service 직접 호출을 제거한다.
- 논의 필요: PATCH/DELETE를 같은 차수에 묶을지 여부
- 선택지:
  - A. PATCH만 먼저 이전
  - B. PATCH/DELETE를 같은 write lane으로 함께 이전
- 추천: B. 같은 템플릿 소유권/수정 금지 규칙을 공유하므로 한 번에 옮기는 편이 더 일관적이다.
- 사용자 방향: B

## 차수 2
- 작업내용: backend write service/controller 테스트와 web route fetch translation 테스트를 추가하고, runtime smoke evidence를 남긴다.
- 논의 필요: authenticated runtime smoke를 어디까지 요구할지
- 선택지:
  - A. backend curl smoke + web unit route tests
  - B. Next runtime auth smoke까지 강행
- 추천: A. 현재 outward auth가 Next 세션에 묶여 있으므로 이번 차수에서는 backend runtime smoke와 web route translation test를 결합해 증거를 남긴다.
- 사용자 방향: A
