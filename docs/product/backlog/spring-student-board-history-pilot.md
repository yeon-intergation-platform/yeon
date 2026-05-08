# spring student-board-history pilot

## 작업내용
- `members/[memberId]/board-history` route의 direct Next service 의존을 Spring read API로 치환한다.
- Spring에 member board-history read lane을 추가한다.
- `memberStudentBoardResponse` 응답 shape를 유지한다.

## 논의 필요
- 이번 차수는 board-history read만 다룬다.
- student-board list/read, mutation, public-check는 후속 lane으로 남긴다.

## 선택지
1. member board-history read만 먼저 전환
2. student-board read 전체를 한 번에 전환

## 추천
- 1번. route 하나와 member history 쿼리만 옮기는 것이 가장 작은 안전 lane이다.

## 사용자 방향
- 추천 기준으로 진행
