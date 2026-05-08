# spring users pilot

## 작업내용
- users list/create route와 service를 Spring으로 이동한다.
- Next `/api/v1/users` route는 thin BFF로 전환한다.

## 논의 필요
- 없음. 단일 route + 단일 저장소 lane이다.

## 선택지
1. GET/POST 동시 이동
2. GET만 먼저 이동

## 추천
- 1. GET/POST 동시 이동
- 이유: 같은 users 저장소와 duplicate email 규칙을 공유해서 한 번에 옮기는 편이 더 작다.

## 사용자 방향
- 추천 기준으로 진행
