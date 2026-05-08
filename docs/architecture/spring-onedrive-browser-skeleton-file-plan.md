# spring-onedrive-browser skeleton file plan

## backend
- `onedrive_browser/dto/*`
- `onedrive_browser/repository/OneDriveBrowserRepository.java`
- `onedrive_browser/service/OneDriveBrowserService.java`
- `onedrive_browser/controller/OneDriveBrowserController.java`
- `onedrive_browser/controller/OneDriveBrowserControllerTests.java`

## web
- `src/server/onedrive-browser-spring-client.ts`
- `src/app/api/v1/integrations/onedrive/status/route.ts`
- `src/app/api/v1/integrations/onedrive/files/route.ts`
- `src/app/api/v1/integrations/onedrive/file/[fileId]/route.ts`
- route tests 3개

## 완료 조건
- route layer direct `onedrive-service` 제거
- backend targeted tests 통과
- web route vitest/typecheck/build 통과
