# spring student-board patch package plan

- package: `world.yeon.backend.student_board_write`
- controller: `PATCH /spaces/{spaceId}/student-board/{memberId}`
- service:
  - owned member context 검증
  - board snapshot upsert
  - history append 판단
  - 응답은 `student_board_read` service 재사용
- repository:
  - owned member context 조회
  - existing snapshot 조회
  - snapshot upsert
  - history insert
