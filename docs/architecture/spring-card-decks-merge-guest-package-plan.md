# spring card-decks merge-guest package plan

- `world.yeon.backend.card_decks.merge_guest.controller.MergeGuestCardDeckController`
- `world.yeon.backend.card_decks.merge_guest.service.MergeGuestCardDeckService`
- `world.yeon.backend.card_decks.merge_guest.repository.MergeGuestCardDeckRepository`

책임:
- Spring이 deck/item insert transaction 전체를 담당
- Next는 auth + payload parse + Spring 호출만 담당
