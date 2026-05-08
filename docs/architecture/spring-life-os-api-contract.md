# spring life-os api contract

- `GET /life-os/days`
- `POST /life-os/days`
- `GET /life-os/days/{date}`
- `PUT /life-os/days/{date}`
- `GET /life-os/reports/daily?localDate=...`
- `GET /life-os/reports/weekly?periodStart=...&periodEnd=...`
- header: `X-Yeon-User-Id`
- Next response shape 유지
