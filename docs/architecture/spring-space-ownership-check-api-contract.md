# spring space ownership check api contract

- method: `GET`
- path: `/spaces/{spaceId}/ownership-check`
- headers:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- success: `{ ok: true }`
- error: 404 when owned space is missing
