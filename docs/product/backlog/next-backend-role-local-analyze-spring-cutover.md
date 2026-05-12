# Next backend-role local analyze Spring cutover

## 1차

### 작업내용

- `apps/web/src/app/api/v1/integrations/local/analyze/route.ts`의 DB/분석 서비스 직접 호출을 제거한다.
- Spring `apps/backend`에 `POST /integrations/local/analyze`를 추가해 로컬 파일 업로드/초안 복구, 분석 상태 저장, 미리보기 저장, 오류 저장을 담당하게 한다.
- Next route는 인증 후 multipart body와 Accept 헤더를 Spring으로 전달하는 BFF만 담당한다.

### 논의 필요

- 이미지 OCR은 기존 Google Vision 기반에서 Spring 내부 OpenAI vision 해석으로 우선 이관한다. Google Vision 동등 구현이 필요하면 후속 PR에서 별도 라이브러리/인증 경로를 붙인다.

### 선택지

1. CSV/TXT만 먼저 Spring 분석으로 옮긴다.
2. CSV/TXT/XLSX/PDF/Image를 한 PR에서 Spring 분석으로 옮기되, 복잡한 workbook 구조 최적화는 후속 개선으로 둔다.
3. Next 내부 서비스를 유지하고 route import만 숨긴다.

### 추천

- 2번. Next backend-role 0% 목표에 맞게 route의 DB/AI 소유권을 Spring으로 넘기고, 세부 분석 정확도는 Spring service 내부에서 반복 개선한다.

### 사용자 방향

-
