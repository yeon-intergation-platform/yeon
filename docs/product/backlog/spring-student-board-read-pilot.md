# spring student-board read pilot

## 작업내용
- `student-board` GET read 경계를 Spring으로 이동한다.
- Next route는 thin BFF로 전환하고, `student-board/[memberId] PATCH`가 이후 동일 read source를 재사용할 수 있게 만든다.
- 대상은 `/spaces/{spaceId}/student-board?historyPeriod=...` read path 한정이다.

## 논의 필요
- PATCH를 즉시 같이 옮길지, read 먼저 고정 후 mutation lane을 별도 차수로 나눌지.

## 선택지
1. GET read만 먼저 Spring 이동
2. GET read + PATCH를 한 차수에 동시 이동

## 추천
- 1. GET read만 먼저 Spring 이동
- 이유: PATCH가 full board response를 반환하므로 read source of truth를 먼저 고정하는 편이 테스트와 회귀 범위를 줄인다.

## 사용자 방향
- 추천 기준으로 진행
