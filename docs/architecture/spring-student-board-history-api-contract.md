# spring student-board-history api contract

## endpoint
- `GET /spaces/{spaceId}/members/{memberId}/board-history?period=30d`
- headers
  - `X-Yeon-User-Id`

## response
```json
{
  "period": "30d",
  "dailyCells": [
    {
      "date": "2026-05-08",
      "attendanceStatus": "present",
      "assignmentStatus": "done",
      "assignmentLink": null,
      "occurredAt": "2026-05-08T00:00:00Z",
      "source": "manual"
    }
  ],
  "history": [
    {
      "id": "smbh_xxx",
      "memberId": "mem_xxx",
      "memberName": "홍길동",
      "historyDate": "2026-05-08",
      "occurredAt": "2026-05-08T00:00:00Z",
      "attendanceStatus": "present",
      "assignmentStatus": "done",
      "assignmentLink": null,
      "source": "manual"
    }
  ]
}
```

## errors
- 400: invalid period
- 404: 스페이스/수강생 없음 또는 권한 없음
