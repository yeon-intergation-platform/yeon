# Next 백엔드 역할 경계 최종 감사

기준: `apps/web/src/app/api` 전수 스캔 (`2026-05-13`)

## 1) 감사 요약

- `route.ts` 총 수: `140`
- `@/server/db|drizzle-orm|pg|DATABASE_URL` 직접 참조: `0`
- `@/server/auth/` 직접 참조: `21`
- `@/server/services/service-error` 직접 참조: `0` (이관 완료)
- `@/server/errors/service-error` 직접 참조: `37`

- **허용 카테고리 집계**
  - `cookie bridge`: 19
  - `OAuth redirect bridge`: 6
  - `file/stream adapter`: 21
  - `Spring proxy/BFF`: 94

- **제거 필요 라우트: `0`**

## 2) 라우트 단위 분류

| route | 분류 | 근거(대표 import) | 제거 필요 판정 |
| --- | --- | --- | --- |
| `apps/web/src/app/api/auth/credentials/login/route.ts` | cookie bridge | import { AuthFlowError } from "@/server/auth/auth-errors";<br>import { applyAuthSessionCookie } from "@/server/auth/session"; | 유지(허용) |
| `apps/web/src/app/api/auth/credentials/register/route.ts` | cookie bridge | import { AuthFlowError } from "@/server/auth/auth-errors";<br>import { registerCredentialInSpring } from "@/server/credential-auth-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/auth/credentials/resend-verification/route.ts` | cookie bridge | import { AuthFlowError } from "@/server/auth/auth-errors";<br>import { resendCredentialVerificationInSpring } from "@/server/credential-auth-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/auth/credentials/reset-confirm/route.ts` | cookie bridge | import { AuthFlowError } from "@/server/auth/auth-errors";<br>import { confirmCredentialPasswordResetInSpring } from "@/server/credential-auth-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/auth/credentials/reset-request/route.ts` | cookie bridge | import { AuthFlowError } from "@/server/auth/auth-errors";<br>import { requestCredentialPasswordResetInSpring } from "@/server/credential-auth-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/auth/credentials/set-password/route.ts` | cookie bridge | import { AuthFlowError } from "@/server/auth/auth-errors";<br>import { getAuthSessionTokenFromRequest } from "@/server/auth/request-session-token"; | 유지(허용) |
| `apps/web/src/app/api/auth/credentials/verify/route.ts` | cookie bridge | import { AuthFlowError } from "@/server/auth/auth-errors";<br>import { getAppOrigin } from "@/server/auth/constants"; | 유지(허용) |
| `apps/web/src/app/api/auth/dev-login/route.ts` | cookie bridge | import { applyAuthSessionCookie } from "@/server/auth/session"; | 유지(허용) |
| `apps/web/src/app/api/auth/google/callback/route.ts` | OAuth redirect bridge | import { socialProviders } from "@/server/auth/constants";<br>import { completeSocialAuth } from "@/server/auth/handlers"; | 유지(허용) |
| `apps/web/src/app/api/auth/google/route.ts` | cookie bridge | import { socialProviders } from "@/server/auth/constants";<br>import { startSocialAuth } from "@/server/auth/handlers"; | 유지(허용) |
| `apps/web/src/app/api/auth/kakao/callback/route.ts` | OAuth redirect bridge | import { socialProviders } from "@/server/auth/constants";<br>import { completeSocialAuth } from "@/server/auth/handlers"; | 유지(허용) |
| `apps/web/src/app/api/auth/kakao/route.ts` | cookie bridge | import { socialProviders } from "@/server/auth/constants";<br>import { startSocialAuth } from "@/server/auth/handlers"; | 유지(허용) |
| `apps/web/src/app/api/auth/logout/route.ts` | cookie bridge | import { clearAuthSessionCookie } from "@/server/auth/session";<br>import { deleteRootAuthSessionInSpring } from "@/server/auth-session-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/auth/session/cleanup/route.ts` | cookie bridge | import { clearAuthSessionCookie } from "@/server/auth/session";<br>import { deleteRootAuthSessionInSpring } from "@/server/auth-session-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/health/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/test/backend-bootstrap-health/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/test/sample-xlsx/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/test/space-import-sample/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/auth/session/route.ts` | cookie bridge | import { getAuthSessionTokenFromRequest } from "@/server/auth/request-session-token";<br>import { clearAuthSessionCookie } from "@/server/auth/session"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/[deckId]/items/[itemId]/review/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/[deckId]/items/[itemId]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/[deckId]/items/bulk/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/[deckId]/items/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/[deckId]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/assets/[...assetKey]/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/assets/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/merge-guest/route.ts` | cookie bridge | import { getCurrentAuthUser } from "@/server/auth/session"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-decks/study-preference/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/card-rooms/[roomId]/messages/route.ts` | Spring proxy/BFF | import { CardRoomsSpringBackendHttpError, createCardRoomMessageInSpring } from "@/server/card-rooms-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-rooms/[roomId]/next/route.ts` | Spring proxy/BFF | import { CardRoomsSpringBackendHttpError, nextCardRoomCardInSpring } from "@/server/card-rooms-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-rooms/[roomId]/participants/[participantId]/route.ts` | Spring proxy/BFF | import { CardRoomsSpringBackendHttpError, leaveCardRoomInSpring, updateCardRoomParticipantInSpring } from "@/server/card-rooms-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-rooms/[roomId]/participants/route.ts` | cookie bridge | import { getCurrentAuthUser } from "@/server/auth/session";<br>import { CardRoomsSpringBackendHttpError, joinCardRoomInSpring } from "@/server/card-rooms-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-rooms/[roomId]/results/route.ts` | Spring proxy/BFF | import { CardRoomsSpringBackendHttpError, submitCardRoomResultInSpring } from "@/server/card-rooms-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-rooms/[roomId]/reveal/route.ts` | Spring proxy/BFF | import { CardRoomsSpringBackendHttpError, revealCardRoomInSpring } from "@/server/card-rooms-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-rooms/[roomId]/route.ts` | Spring proxy/BFF | import { CardRoomsSpringBackendHttpError, fetchCardRoomFromSpring } from "@/server/card-rooms-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/card-rooms/route.ts` | cookie bridge | import { getCurrentAuthUser } from "@/server/auth/session";<br>import { CardRoomsSpringBackendHttpError, createCardRoomInSpring, fetchCardRoomsFromSpring } from "@/server/card-rooms-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/ask/[postId]/vote/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/ask/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/auth/request-otp/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/auth/session/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/auth/verify-otp/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/chat/open/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/chat/rooms/[roomId]/messages/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/chat/rooms/[roomId]/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/chat/rooms/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/feed/[postId]/replies/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/feed/[postId]/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/feed/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/friends/overview/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/friends/requests/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/profile/me/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/profiles/[profileId]/block/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/profiles/[profileId]/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/chat-service/reports/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/community-chat/messages/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/community-presence/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/[recordId]/analyze/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/[recordId]/audio/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/[recordId]/chat/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/[recordId]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/[recordId]/segments/[segmentId]/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/[recordId]/segments/bulk/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/[recordId]/transcribe/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/analyze-trend/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/details/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/counseling-records/students/route.ts` | Spring proxy/BFF | import { fetchCounselingRecordStudentsFromSpring, CounselingRecordStudentsSpringBackendHttpError } from "@/server/counseling-record-students-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/home/insight-banners/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/googledrive/analyze/route.ts` | file/stream adapter | import { downloadGoogleDriveFileFromSpring, GoogleDriveBrowserSpringBackendHttpError } from "@/server/googledrive-browser-spring-client";<br>import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/googledrive/auth/callback/route.ts` | OAuth redirect bridge | import { CloudOAuthSpringBackendHttpError, exchangeGoogleDriveOAuthCodeInSpring } from "@/server/cloud-oauth-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/googledrive/auth/route.ts` | OAuth redirect bridge | import { CloudOAuthSpringBackendHttpError, fetchGoogleDriveOAuthUrlFromSpring } from "@/server/cloud-oauth-spring-client";<br>import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/googledrive/file/[fileId]/route.ts` | file/stream adapter | import { GoogleDriveBrowserSpringBackendHttpError, downloadGoogleDriveFileFromSpring } from "@/server/googledrive-browser-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/googledrive/files/route.ts` | file/stream adapter | import { GoogleDriveBrowserSpringBackendHttpError, fetchGoogleDriveFilesFromSpring } from "@/server/googledrive-browser-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/googledrive/import/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/googledrive/status/route.ts` | file/stream adapter | import { GoogleDriveBrowserSpringBackendHttpError, fetchGoogleDriveStatusFromSpring } from "@/server/googledrive-browser-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/local/analyze/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/local/drafts/[draftId]/file/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/local/drafts/[draftId]/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/local/drafts/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/local/import/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/onedrive/analyze/route.ts` | file/stream adapter | import { downloadOneDriveFileFromSpring, OneDriveBrowserSpringBackendHttpError } from "@/server/onedrive-browser-spring-client";<br>import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/onedrive/auth/callback/route.ts` | OAuth redirect bridge | import { CloudOAuthSpringBackendHttpError, exchangeOneDriveOAuthCodeInSpring } from "@/server/cloud-oauth-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/onedrive/auth/route.ts` | OAuth redirect bridge | import { CloudOAuthSpringBackendHttpError, fetchOneDriveOAuthUrlFromSpring } from "@/server/cloud-oauth-spring-client";<br>import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/onedrive/file/[fileId]/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/onedrive/files/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/onedrive/import/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/integrations/onedrive/status/route.ts` | file/stream adapter | - | 유지(허용) |
| `apps/web/src/app/api/v1/life-os/days/[date]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/life-os/days/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/life-os/reports/daily/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/life-os/reports/weekly/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/members/[memberId]/route.ts` | Spring proxy/BFF | import { fetchMemberRiskProfilesFromSpring, MemberRiskSpringBackendHttpError } from "@/server/member-risk-spring-client";<br>import { fetchOwnedMemberFromSpring, MembersSpringBackendHttpError } from "@/server/members-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/mobile/auth/credentials/login/route.ts` | cookie bridge | import { AuthFlowError } from "@/server/auth/auth-errors";<br>import { loginCredentialMobileInSpring } from "@/server/credential-auth-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/public-check-sessions/[token]/qr/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/public-check-sessions/[token]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/public-check-sessions/[token]/submit/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/public-check-sessions/[token]/verify/route.ts` | Spring proxy/BFF | import { applyRememberedPublicCheckIdentityCookie } from "@/server/public-check-device-cookie-bff"; | 유지(허용) |
| `apps/web/src/app/api/v1/space-templates/[templateId]/duplicate/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/space-templates/[templateId]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/space-templates/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/apply-template/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/export/csv/route.ts` | file/stream adapter | import { buildSpaceExportData } from "@/server/sheet-export-bff";<br>import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/export/xlsx/route.ts` | file/stream adapter | import { buildSpaceExportData } from "@/server/sheet-export-bff";<br>import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/member-fields/[fieldId]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/reorder/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reorder/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reset/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/board-history/route.ts` | Spring proxy/BFF | import { fetchMemberStudentBoardHistoryFromSpring, StudentBoardHistorySpringBackendHttpError } from "@/server/student-board-history-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/counseling-records/route.ts` | Spring proxy/BFF | import { fetchMemberInSpaceFromSpring, MembersSpringBackendHttpError } from "@/server/members-spring-client";<br>import { fetchMemberCounselingRecordsFromSpring, MemberCounselingRecordsSpringBackendHttpError } from "@/server/member-counseling-records-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/field-values/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/profile-import/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/route.ts` | Spring proxy/BFF | import { deleteMemberInSpring, MembersSpringBackendHttpError, updateMemberInSpring } from "@/server/members-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/members/bulk-delete/route.ts` | Spring proxy/BFF | import { bulkDeleteMembersInSpring, MembersSpringBackendHttpError } from "@/server/members-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/members/route.ts` | Spring proxy/BFF | import { fetchMemberRiskProfilesFromSpring, MemberRiskSpringBackendHttpError } from "@/server/member-risk-spring-client";<br>import { createMemberInSpring, fetchMembersFromSpring, MembersSpringBackendHttpError } from "@/server/members-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/public-check-locations/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/public-check-sessions/[sessionId]/route.ts` | Spring proxy/BFF | import { PublicCheckSessionsSpringBackendHttpError, updatePublicCheckSessionInSpring } from "@/server/public-check-sessions-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/import/route.ts` | file/stream adapter | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/sync/route.ts` | Spring proxy/BFF | import { exportSpaceToSheet } from "@/server/sheet-export-bff";<br>import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/sheet-integrations/[integrationId]/sync/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/sheet-integrations/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/snapshot-template/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/student-board/[memberId]/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/[spaceId]/student-board/route.ts` | Spring proxy/BFF | import { createPublicCheckSessionInSpring, PublicCheckSessionsSpringBackendHttpError } from "@/server/public-check-sessions-spring-client"; | 유지(허용) |
| `apps/web/src/app/api/v1/spaces/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/typing-character-frames/[characterId]/route.ts` | cookie bridge | import { getCurrentAuthUser } from "@/server/auth/session"; | 유지(허용) |
| `apps/web/src/app/api/v1/typing-character-frames/route.ts` | Spring proxy/BFF | - | 유지(허용) |
| `apps/web/src/app/api/v1/typing-decks/[deckId]/passages/[passageId]/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/typing-decks/[deckId]/passages/bulk/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/typing-decks/[deckId]/passages/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/typing-decks/[deckId]/race-seed/route.ts` | Spring proxy/BFF | import { createTypingRaceSeedFromDetail } from "@/server/typing-race-seed";<br>import { getDefaultTypingDeckDetail } from "@/server/typing-deck-defaults"; | 유지(허용) |
| `apps/web/src/app/api/v1/typing-decks/[deckId]/route.ts` | Spring proxy/BFF | import { getDefaultTypingDeckDetail } from "@/server/typing-deck-defaults";<br>import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/typing-decks/route.ts` | Spring proxy/BFF | import { ServiceError } from "@/server/errors/service-error"; | 유지(허용) |
| `apps/web/src/app/api/v1/users/route.ts` | cookie bridge | import { AUTH_SESSION_COOKIE_NAME } from "@/server/auth/constants"; | 유지(허용) |

## 3) auth/session/OAuth 점검

- `api/auth/*` 계열: 쿠키 브릿지/리다이렉트 브리지 수행. `Next`는 토큰 발급, 세션 쿠키 주입/해제, OAuth 핸들러 위임까지 수행하나 인증/도메인 판정은 Spring 호출 단에서 수행.
- `api/v1/auth/session`, `api/v1/mobile/auth/credentials/login`, `api/auth/logout`, `/api/auth/*/callback` 또한 `spring` 호출 기반으로 동작하는 경계 허용 라우트로 판정.
- 제거 필요 항목: 없음
