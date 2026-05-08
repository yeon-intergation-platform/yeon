# spring public-check session patch api contract

## endpoint
- `PATCH /spaces/{spaceId}/public-check-sessions/{sessionId}`
- headers
  - `X-Yeon-User-Id`
- body
```json
{
  "status": "closed",
  "closesAt": "2026-05-08T09:00:00.000Z"
}
```

## response
```json
{
  "session": {
    "id": "pcs_1",
    "title": "체크인",
    "status": "closed",
    "checkMode": "attendance_and_assignment",
    "enabledMethods": ["qr"],
    "publicPath": "/check/token123",
    "opensAt": null,
    "closesAt": "2026-05-08T09:00:00.000Z",
    "locationLabel": null,
    "radiusMeters": null,
    "createdAt": "2026-05-08T07:00:00.000Z"
  }
}
```

## errors
- 400: invalid request
- 404: space/session not found
