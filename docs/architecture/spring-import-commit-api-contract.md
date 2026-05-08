# spring import commit api contract

- `POST /import-commit`
- header: `X-Yeon-User-Id`
- body: `{ draftId?: string, preview: { cohorts: [...] } }`
- response: `{ created: { spaces, members }, spaceIds }`
- draftId가 있으면 import_drafts importing/imported 상태 전이까지 Spring에서 처리
