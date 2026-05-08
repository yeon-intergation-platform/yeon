# Spring card-decks route API contract

- `GET /card-decks`
- `POST /card-decks`
- `GET /card-decks/{deckId}`
- `PATCH /card-decks/{deckId}`
- `DELETE /card-decks/{deckId}`
- `POST /card-decks/{deckId}/items`
- `POST /card-decks/{deckId}/items/bulk`
- `PATCH /card-decks/{deckId}/items/{itemId}`
- `DELETE /card-decks/{deckId}/items/{itemId}`
- `POST /card-decks/{deckId}/items/{itemId}/review`
- `GET /card-decks/study-preference`
- `PATCH /card-decks/study-preference`

## Boundary
- Spring 담당:
  - deck CRUD
  - item CRUD / bulk create
  - review scheduling
  - user card study preference
- Next 담당:
  - auth gate
  - BFF error translation
