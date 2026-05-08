# spring spaces CRUD API contract

- `GET /spaces`
  - header: `X-Yeon-User-Id`
  - response: `{ spaces: SpaceResponse[] }`
- `POST /spaces`
  - header: `X-Yeon-User-Id`
  - body: `{ name, description?, startDate?, endDate? }`
  - response: `{ space: SpaceResponse }`
- `GET /spaces/{spaceId}`
  - header: `X-Yeon-User-Id`
  - response: `{ space: SpaceResponse }`
- `PATCH /spaces/{spaceId}`
  - header: `X-Yeon-User-Id`
  - body: `{ name?, startDate?, endDate? }`
  - response: `{ space: SpaceResponse }`
- `DELETE /spaces/{spaceId}`
  - header: `X-Yeon-User-Id`
  - response: `{ ok: true }`

`SpaceResponse`
- `id`: publicId
- `name`
- `description`
- `startDate`
- `endDate`
- `createdByUserId`
- `createdAt`
- `updatedAt`
