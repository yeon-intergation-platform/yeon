# spring-googledrive-browser skeleton file plan

## backend
- `googledrive_browser/dto/*`
- `googledrive_browser/repository/GoogleDriveBrowserRepository.java`
- `googledrive_browser/service/GoogleDriveBrowserService.java`
- `googledrive_browser/controller/GoogleDriveBrowserController.java`
- `googledrive_browser/controller/GoogleDriveBrowserControllerTests.java`

## web
- `src/server/googledrive-browser-spring-client.ts`
- `src/app/api/v1/integrations/googledrive/status/route.ts`
- `src/app/api/v1/integrations/googledrive/files/route.ts`
- `src/app/api/v1/integrations/googledrive/file/[fileId]/route.ts`
- route tests 3개

## 완료 조건
- route layer direct `googledrive-service` 제거
- backend targeted tests 통과
- web route vitest/typecheck/build 통과
