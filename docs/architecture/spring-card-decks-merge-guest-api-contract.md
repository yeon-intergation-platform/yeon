# spring card-decks merge-guest API contract

- `POST /card-decks/merge-guest`
  - header: `X-Yeon-User-Id`
  - body: `MergeGuestRequest`
  - response: `MergeGuestResponse`

에러:
- 400 잘못된 payload / 빈 제목 / 빈 카드
- 500 insert 실패
