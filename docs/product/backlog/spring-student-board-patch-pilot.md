# spring student-board patch pilot

## 작업내용
- `student-board/[memberId] PATCH`를 Spring으로 이동한다.
- mutation 후 응답은 이미 Spring으로 이동한 student-board read 응답 shape를 그대로 유지한다.
- Next route layer의 `student-board-service` direct 의존을 제거한다.

## 논의 필요
- mutation 응답의 history period를 7d로 고정할지, query 기반으로 확장할지.

## 선택지
1. 기존 Next 동작과 동일하게 7d 반환
2. PATCH도 historyPeriod query를 받도록 확장

## 추천
- 1. 7d 반환 유지
- 이유: 기존 동작과 동일하고 diff를 최소화할 수 있다.

## 사용자 방향
- 추천 기준으로 진행
