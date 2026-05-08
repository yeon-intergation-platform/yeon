# spring public-check session create skeleton file plan

## backend
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/dto/CreatePublicCheckSessionRequest.java`
- `apps/backend/src/main/java/world/yeon/backend/public_check_sessions/dto/CreatePublicCheckSessionResponse.java`
- existing `PublicCheckSessionController.java`
- existing `PublicCheckSessionRepository.java`
- existing `PublicCheckSessionService.java`

## backend tests
- extend:
  - `PublicCheckSessionControllerTests`
  - `PublicCheckSessionRepositoryTests`
  - `PublicCheckSessionServiceTests`

## web
- extend:
  - `apps/web/src/server/public-check-sessions-spring-client.ts`
  - `apps/web/src/app/api/v1/spaces/[spaceId]/student-board/route.ts`
  - route tests for POST path
