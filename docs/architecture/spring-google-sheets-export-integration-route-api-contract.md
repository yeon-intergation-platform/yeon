# Spring Google Sheets Export Integration Route API Contract

## GET
- `GET /spaces/{spaceId}/sheet-export/integration`
- response
```json
{ "integration": null }
```
또는
```json
{
  "integration": {
    "publicId": "sgi_export",
    "sheetUrl": "https://docs.google.com/spreadsheets/d/sheet-1/edit",
    "sheetId": "sheet-1",
    "dataType": "export",
    "columnMapping": null,
    "lastSyncedAt": null,
    "createdAt": "2026-05-08T00:00:00Z",
    "updatedAt": "2026-05-08T00:00:00Z"
  }
}
```

## PUT
- request
```json
{ "sheetUrl": "https://docs.google.com/spreadsheets/d/sheet-1/edit" }
```
- response: `{ "integration": ... }`

## DELETE
- response
```json
{ "ok": true }
```
