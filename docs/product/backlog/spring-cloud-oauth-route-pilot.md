# cloud oauth route Spring pilot

## 작업내용
- `/api/v1/integrations/googledrive/auth`
- `/api/v1/integrations/googledrive/auth/callback`
- `/api/v1/integrations/onedrive/auth`
- `/api/v1/integrations/onedrive/auth/callback`
- Next direct oauth url/token exchange/save 의존 제거

## 논의 필요
- cookie state/user 관리와 redirect 응답은 Next에 유지

## 선택지
- A. auth start/callback route만 먼저 thin BFF화
- B. auth + analyze/import shared까지 한 번에 이동

## 추천
- A. auth start/callback route만 먼저 thin BFF화

## 사용자 방향
- 추천 기준으로 진행
