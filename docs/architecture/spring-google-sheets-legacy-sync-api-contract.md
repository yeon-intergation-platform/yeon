# Spring Google Sheets Legacy Sync API Contract

- `GET /spaces/{spaceId}/sheet-integrations`
  - response: `{ integrations: [...] }`
- `POST /spaces/{spaceId}/sheet-integrations`
  - request: `{ sheetUrl, dataType, columnMapping }`
  - response: `{ integration }`
- `POST /spaces/{spaceId}/sheet-integrations/{integrationId}/sync`
  - response: `{ synced, errors }`

에러 원칙:
- invalid sheet url → 400
- space/integration not found → 404
- google credential/read failure → 500
