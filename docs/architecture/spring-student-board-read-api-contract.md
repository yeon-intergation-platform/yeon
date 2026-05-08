# spring student-board read api contract

- method: `GET`
- path: `/spaces/{spaceId}/student-board`
- headers:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- query:
  - `historyPeriod`: `space | 7d | 30d | 365d` (default `7d`)
- success 200:
  - `rows[]`
  - `sessions[]`
  - `historyPeriod`
- error:
  - 400 invalid history period
  - 404 owned space not found
