# spring local import drafts route api contract

- `GET /import-drafts?provider=local&statuses=...&limit=...`
- `GET /import-drafts/{draftId}`
- `PATCH /import-drafts/{draftId}/preview`
- `DELETE /import-drafts/{draftId}`
- `GET /import-drafts/{draftId}/file`
- header: `X-Yeon-User-Id`
- Next response shape 유지
