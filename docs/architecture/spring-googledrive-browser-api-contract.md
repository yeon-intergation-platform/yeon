# spring-googledrive-browser api contract

## GET /googledrive/status
- headers
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- response 200
```json
{
  "connected": true,
  "sheetSyncReady": true
}
```

## GET /googledrive/files?folderId=
- headers
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- response 200
```json
{
  "files": [
    {
      "id": "file-1",
      "name": "students.xlsx",
      "size": 12,
      "lastModifiedAt": "2026-05-08T00:00:00Z",
      "mimeType": "application/vnd.ms-excel"
    }
  ]
}
```

## GET /googledrive/files/{fileId}/content?mimeType=
- headers
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- response 200
  - binary body
  - `Content-Type` preserved

## error shape
```json
{
  "code": "GOOGLE_DRIVE_NOT_CONNECTED",
  "message": "Google Drive가 연결되어 있지 않습니다."
}
```

## translation rule
- Next는 Spring status/message를 그대로 `jsonError`로 노출한다.
