# cloud analyze transport Spring pilot

## 작업내용
- `/api/v1/integrations/googledrive/analyze`
- `/api/v1/integrations/onedrive/analyze`
- route layer direct cloud token/download 의존 제거

## 논의 필요
- draft lifecycle / analyze engine / SSE는 이번 차수 범위 밖

## 선택지
- A. analyze route transport만 먼저 Spring browser endpoint 재사용
- B. analyze engine 전체를 한 번에 Spring 이동

## 추천
- A. analyze route transport만 먼저 Spring browser endpoint 재사용

## 사용자 방향
- 추천 기준으로 진행
