# spring activity-logs skeleton file plan

## backend
- `apps/backend/src/main/java/world/yeon/backend/activity_logs/controller/ActivityLogController.java`
- `apps/backend/src/main/java/world/yeon/backend/activity_logs/dto/ActivityLogResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/activity_logs/dto/GetActivityLogsResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/activity_logs/dto/CreateActivityLogRequest.java`
- `apps/backend/src/main/java/world/yeon/backend/activity_logs/dto/CreateActivityLogResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/activity_logs/repository/ActivityLogRepository.java`
- `apps/backend/src/main/java/world/yeon/backend/activity_logs/service/ActivityLogService.java`
- `apps/backend/src/main/java/world/yeon/backend/activity_logs/service/ActivityLogServiceException.java`

## backend tests
- `apps/backend/src/test/java/world/yeon/backend/activity_logs/controller/ActivityLogControllerTests.java`
- `apps/backend/src/test/java/world/yeon/backend/activity_logs/repository/ActivityLogRepositoryTests.java`
- `apps/backend/src/test/java/world/yeon/backend/activity_logs/service/ActivityLogServiceTests.java`

## web
- `apps/web/src/server/activity-logs-spring-client.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/route.ts`
- `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/__tests__/route.test.ts`
