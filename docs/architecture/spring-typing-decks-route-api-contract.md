# Spring typing-decks route API contract

- `GET /typing-decks?scope=&languageTag=&admin=`
  - DB-backed user/public decks만 반환한다.
  - default deck prepend는 Next route layer가 담당한다.
- `POST /typing-decks?admin=`
- `GET /typing-decks/{deckId}?admin=`
- `PATCH /typing-decks/{deckId}?admin=`
- `DELETE /typing-decks/{deckId}?admin=`
- `POST /typing-decks/{deckId}/passages?admin=`
- `POST /typing-decks/{deckId}/passages/bulk?admin=`
- `PATCH /typing-decks/{deckId}/passages/{passageId}?admin=`
- `DELETE /typing-decks/{deckId}/passages/{passageId}?admin=`
- `POST /typing-decks/{deckId}/race-seed`

## Boundary
- Spring 담당:
  - DB-backed typing deck CRUD
  - passage CRUD / bulk create
  - DB-backed race seed 생성
- Next 담당:
  - default deck static catalog/detail merge
  - anonymous/admin auth context 파싱
