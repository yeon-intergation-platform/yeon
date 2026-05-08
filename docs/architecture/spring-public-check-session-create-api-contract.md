# spring public-check session create api contract

## endpoint
- `POST /spaces/{spaceId}/public-check-sessions`
- headers
  - `X-Yeon-User-Id`
- body
```json
{
  "title": "체크인",
  "checkMode": "attendance_and_assignment",
  "enabledMethods": ["qr"],
  "opensAt": null,
  "closesAt": null,
  "locationLabel": null,
  "latitude": null,
  "longitude": null,
  "radiusMeters": null
}
```

## response
```json
{
  "session": {
    "id": "pcs_1",
    "title": "체크인",
    "status": "active",
    "checkMode": "attendance_and_assignment",
    "enabledMethods": ["qr"],
    "publicPath": "/check/token123",
    "opensAt": null,
    "closesAt": null,
    "locationLabel": null,
    "radiusMeters": null,
    "createdAt": "2026-05-08T07:00:00.000Z"
  }
}
```

## errors
- 400: invalid request / invalid location settings
- 404: space not found
