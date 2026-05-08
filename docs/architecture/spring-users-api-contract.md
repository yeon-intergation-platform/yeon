# spring users api contract

- `GET /users`
- `POST /users`
- header: `X-Yeon-User-Id`
- Next response shape 유지
- duplicate email은 `409 DUPLICATE_EMAIL` 유지
