# spring student-board patch api contract

- method: `PATCH`
- path: `/spaces/{spaceId}/student-board/{memberId}`
- headers:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- body:
  - `attendanceStatus?`
  - `assignmentStatus?`
  - `assignmentLink?`
- success 200:
  - `studentBoardResponseSchema` shape 유지
- error:
  - 400 invalid request
  - 404 member not found or no access
