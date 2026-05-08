# spring home insight banner pilot

## 작업내용
- home insight banner dismiss read/write를 Spring으로 이동한다.
- Next route는 thin BFF로 전환한다.

## 논의 필요
- 없음. 단순 read/write lane이다.

## 선택지
1. GET/POST 동시 이동
2. GET만 먼저 이동

## 추천
- 1. GET/POST 동시 이동
- 이유: 같은 저장소/응답 모델을 공유해서 함께 옮기는 편이 더 작다.

## 사용자 방향
- 추천 기준으로 진행
