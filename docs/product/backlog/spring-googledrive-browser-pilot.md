# googledrive browser Spring pilot

## 작업내용
- `/api/v1/integrations/googledrive/status`
- `/api/v1/integrations/googledrive/files`
- `/api/v1/integrations/googledrive/file/[fileId]`
- Next direct `googledrive-service` read/browser 의존 제거

## 논의 필요
- OAuth start/callback, analyze lane는 이번 차수 범위 밖

## 선택지
- A. browser/status 3 route만 먼저 Spring 이동
- B. auth/callback/analyze까지 한 번에 묶기

## 추천
- A. browser/status 3 route만 먼저 Spring 이동

## 사용자 방향
- 추천 기준으로 진행
