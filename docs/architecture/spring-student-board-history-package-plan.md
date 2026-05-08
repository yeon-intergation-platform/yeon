# spring student-board-history package plan

- package: `world.yeon.backend.student_board_history`
- subpackages
  - `controller`
  - `dto`
  - `repository`
  - `service`

## responsibilities
- repository
  - owned space/member context 조회
  - history row 조회
- service
  - period window 계산
  - dailyCells/history 응답 조합
- controller
  - GET endpoint
  - 400/404 translation
