# spring space ownership check package plan

- package: `world.yeon.backend.space_access`
- controller: `GET /spaces/{spaceId}/ownership-check`
- response: `{ ok: true }`
- first consumer: `public-check-locations` route
