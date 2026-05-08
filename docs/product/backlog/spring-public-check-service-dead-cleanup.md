# spring public-check-service dead cleanup

## 작업내용
- route cutover 이후 production consumer가 사라진 `public-check-service.ts`와 관련 dead test를 제거한다.
- 남아 있던 `student-board-service` direct import surface를 줄인다.

## 논의 필요
- 없음. consumer가 0이면 제거가 맞다.

## 선택지
1. dead file 삭제
2. 보관용으로 남기기

## 추천
- 1. dead file 삭제
- 이유: repo-wide migration inventory를 흐리지 않고 direct dependency surface를 줄인다.

## 사용자 방향
- 추천 기준으로 진행
