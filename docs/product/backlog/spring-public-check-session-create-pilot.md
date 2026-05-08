# spring public-check session create pilot

## 작업내용
- `spaces/[spaceId]/student-board` POST route의 direct Next service 의존을 Spring create API로 치환한다.
- 기존 `public_check_sessions` Spring package에 create lane을 추가한다.
- session summary 응답 shape를 유지한다.

## 논의 필요
- 이번 차수는 POST만 다룬다.
- GET(student-board read), submit/verify/search는 후속 lane으로 남긴다.

## 선택지
1. public-check session POST만 먼저 전환
2. student-board route 전체를 한 번에 전환

## 추천
- 1번. 이미 session PATCH package가 있어 확장 비용이 가장 작다.

## 사용자 방향
- 추천 기준으로 진행
