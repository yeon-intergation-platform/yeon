# spring student-board read package plan

- package: `world.yeon.backend.student_board_read`
- controller: `GET /spaces/{spaceId}/student-board`
- service:
  - owned space 검증
  - historyPeriod 검증
  - members / board snapshot / sessions / history read 조합
  - daily cell 집계 및 응답 조합
- repository:
  - owned space context 조회
  - members 조회
  - board snapshot 조회
  - recent public check sessions 조회
  - board history 조회
