package world.yeon.backend.card_decks.merge_guest.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestCardDeckItemRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestCardDeckRequest;
import world.yeon.backend.card_decks.merge_guest.dto.MergeGuestRequest;
import world.yeon.backend.card_decks.merge_guest.repository.MergeGuestCardDeckRepository;

@ExtendWith(MockitoExtension.class)
class MergeGuestCardDeckServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000951");

	@Mock private MergeGuestCardDeckRepository repository;
	private MergeGuestCardDeckService service;

	@BeforeEach void setUp() {
		service = new MergeGuestCardDeckService(repository);
	}

	@Test void deck와item생성건수를반환한다() {
		when(repository.insertDeck(any(), eq(OWNER_ID), eq("덱"), eq(null), any()))
			.thenReturn(new MergeGuestCardDeckRepository.InsertedDeckRow(1L));
		when(repository.insertItems(eq(1L), any(), any())).thenReturn(2);

		var result = service.merge(OWNER_ID, new MergeGuestRequest(List.of(
			new MergeGuestCardDeckRequest("덱", null, List.of(
				new MergeGuestCardDeckItemRequest("앞", "뒤"),
				new MergeGuestCardDeckItemRequest("앞2", "뒤2")
			))
		)));

		assertThat(result.createdDeckCount()).isEqualTo(1);
		assertThat(result.createdItemCount()).isEqualTo(2);
	}

	@Test void 빈덱제목이면400이다() {
		assertThatThrownBy(() -> service.merge(OWNER_ID, new MergeGuestRequest(List.of(
			new MergeGuestCardDeckRequest(" ", null, List.of())
		))))
			.isInstanceOf(MergeGuestCardDeckServiceException.class)
			.hasMessage("덱 제목은 비워 둘 수 없습니다.");
	}

	@Test void 빈카드면400이다() {
		when(repository.insertDeck(any(), eq(OWNER_ID), eq("덱"), eq(null), any()))
			.thenReturn(new MergeGuestCardDeckRepository.InsertedDeckRow(1L));

		assertThatThrownBy(() -> service.merge(OWNER_ID, new MergeGuestRequest(List.of(
			new MergeGuestCardDeckRequest("덱", null, List.of(
				new MergeGuestCardDeckItemRequest("앞", " ")
			))
		))))
			.isInstanceOf(MergeGuestCardDeckServiceException.class)
			.hasMessage("앞면과 뒷면이 모두 있는 카드만 이관할 수 있습니다. 빈 카드를 정리한 뒤 다시 시도해 주세요.");
	}
}
