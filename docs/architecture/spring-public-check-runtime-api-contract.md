# spring public-check runtime api contract

- GET `/public-check-sessions/{token}?entry=qr|location`
  - returns `{ spaceId, session, shouldClearRememberedIdentity }`
- POST `/public-check-sessions/{token}/verify`
  - returns `{ spaceId, result, rememberedMemberId }`
- POST `/public-check-sessions/{token}/submit`
  - returns `{ spaceId, result, rememberedMemberId, shouldClearRememberedIdentity }`
- Next route remains responsible for remembered identity cookie read/write only.
