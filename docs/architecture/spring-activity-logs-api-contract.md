# spring activity-logs api contract

## endpoints

### GET `/spaces/{spaceId}/members/{memberId}/activity-logs`
- headers
  - `X-Yeon-User-Id`
- query
  - `type?: string`
  - `limit?: number`
- response
```json
{
  "logs": [
    {
      "id": "alg_xxx",
      "memberId": "mem_xxx",
      "spaceId": "space_xxx",
      "type": "coaching-note",
      "status": null,
      "recordedAt": "2026-05-08T00:00:00Z",
      "source": "manual",
      "metadata": {
        "noteText": "메모",
        "authorLabel": "멘토"
      },
      "createdAt": "2026-05-08T00:00:00Z"
    }
  ],
  "totalCount": 1
}
```

### POST `/spaces/{spaceId}/members/{memberId}/activity-logs`
- headers
  - `X-Yeon-User-Id`
- body
```json
{ "text": "메모 내용", "authorLabel": "멘토" }
```
- response
```json
{
  "log": {
    "id": "alg_xxx",
    "memberId": "mem_xxx",
    "spaceId": "space_xxx",
    "type": "coaching-note",
    "status": null,
    "recordedAt": "2026-05-08T00:00:00Z",
    "source": "manual",
    "metadata": {
      "noteText": "메모 내용",
      "authorLabel": "멘토"
    },
    "createdAt": "2026-05-08T00:00:00Z"
  }
}
```

## errors
- 400: 잘못된 limit / 빈 메모
- 404: 수강생 없음, 다른 스페이스 소속
- Spring error shape는 `{ code, message }`
