# spring student-board-history skeleton file plan

## backend
- `apps/backend/src/main/java/world/yeon/backend/student_board_history/controller/StudentBoardHistoryController.java`
- `apps/backend/src/main/java/world/yeon/backend/student_board_history/dto/StudentBoardDailyCellResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/student_board_history/dto/StudentBoardHistoryItemResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/student_board_history/dto/MemberStudentBoardHistoryResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/student_board_history/repository/StudentBoardHistoryRepository.java`
- `apps/backend/src/main/java/world/yeon/backend/student_board_history/service/StudentBoardHistoryService.java`
- `apps/backend/src/main/java/world/yeon/backend/student_board_history/service/StudentBoardHistoryServiceException.java`

## backend tests
- `apps/backend/src/test/java/world/yeon/backend/student_board_history/controller/StudentBoardHistoryControllerTests.java`
- `apps/backend/src/test/java/world/yeon/backend/student_board_history/repository/StudentBoardHistoryRepositoryTests.java`
- `apps/backend/src/test/java/world/yeon/backend/student_board_history/service/StudentBoardHistoryServiceTests.java`

## web
- `apps/web/src/server/student-board-history-spring-client.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/board-history/route.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/board-history/__tests__/route.test.ts`
