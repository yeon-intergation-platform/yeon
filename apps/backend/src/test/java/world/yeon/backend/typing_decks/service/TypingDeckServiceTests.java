package world.yeon.backend.typing_decks.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckPassageRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckPassagesRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingDeckRequest;
import world.yeon.backend.typing_decks.dto.CreateTypingRaceSeedRequest;
import world.yeon.backend.typing_decks.dto.UpdateTypingDeckRequest;
import world.yeon.backend.typing_decks.repository.TypingDeckRepository;

@ExtendWith(MockitoExtension.class)
class TypingDeckServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000981");

	@Mock private TypingDeckRepository repository;
	private TypingDeckService service;

	@BeforeEach void setUp() {
		service = new TypingDeckService(repository);
	}

	@Test void mine목록은로그인이필요하다() {
		assertThatThrownBy(() -> service.listTypingDecks(null, "mine", null, false))
			.isInstanceOf(TypingDeckServiceException.class)
			.hasMessage("로그인이 필요합니다.");
	}

	@Test void 목록응답을반환한다() {
		when(repository.listDecks(eq(OWNER_ID), eq("all"), eq("ko"), eq(false))).thenReturn(List.of(
			new TypingDeckRepository.TypingDeckListRow(1L, "tdk_1", OWNER_ID.toString(), "덱", null, "ko", "public", "user", OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z"), 3)
		));
		var result = service.listTypingDecks(OWNER_ID, "all", "ko", false);
		assertThat(result.decks()).hasSize(1);
		assertThat(result.decks().getFirst().canEdit()).isTrue();
	}

	@Test void 생성응답을반환한다() {
		when(repository.insertDeck(any(), eq(OWNER_ID), eq("새 덱"), eq(null), eq("ko"), eq("private"), eq("user"), any()))
			.thenReturn(new TypingDeckRepository.TypingDeckRow(1L, "tdk_1", OWNER_ID.toString(), "새 덱", null, "ko", "private", "user", OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		var result = service.createTypingDeck(OWNER_ID, new CreateTypingDeckRequest("새 덱", null, "ko", "private"), false);
		assertThat(result.deck().id()).isEqualTo("tdk_1");
	}

	@Test void 기본덱수정은거절한다() {
		when(repository.findDeckByPublicId("default_1"))
			.thenReturn(new TypingDeckRepository.TypingDeckRow(1L, "default_1", OWNER_ID.toString(), "기본", null, "ko", "public", "default", OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		assertThatThrownBy(() -> service.updateTypingDeck(OWNER_ID, "default_1", new UpdateTypingDeckRequest(com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode()), false))
			.isInstanceOf(TypingDeckServiceException.class)
			.hasMessage("기본 덱은 수정할 수 없습니다.");
	}

	@Test void bulkPassages를생성한다() {
		when(repository.findDeckByPublicId("tdk_1"))
			.thenReturn(new TypingDeckRepository.TypingDeckRow(1L, "tdk_1", OWNER_ID.toString(), "덱", null, "ko", "private", "user", OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		when(repository.countPassages(1L)).thenReturn(1);
		when(repository.insertPassage(any(), eq(1L), any(), any(), any(), any(), any(Integer.class), any()))
			.thenReturn(new TypingDeckRepository.TypingDeckPassageRow(10L, "tps_1", 1L, "제목", "문장", "short", "normal", 1, OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		var result = service.createTypingDeckPassages(OWNER_ID, "tdk_1", new CreateTypingDeckPassagesRequest(List.of(new CreateTypingDeckPassageRequest("제목", "문장", "short", "normal", null))), false);
		assertThat(result.passages()).hasSize(1);
	}

	@Test void raceSeed를서명한다() {
		when(repository.findDeckByPublicId("tdk_1"))
			.thenReturn(new TypingDeckRepository.TypingDeckRow(1L, "tdk_1", OWNER_ID.toString(), "공개 덱", null, "ko", "public", "user", OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z")));
		when(repository.listPassagesByDeckId(1L)).thenReturn(List.of(
			new TypingDeckRepository.TypingDeckPassageRow(11L, "tps_1", 1L, "1라운드", "문장", "short", "normal", 0, OffsetDateTime.parse("2026-05-08T00:00:00Z"), OffsetDateTime.parse("2026-05-08T00:00:00Z"))
		));
		var result = service.createTypingRaceSeed(OWNER_ID, "tdk_1", new CreateTypingRaceSeedRequest("tps_1"));
		assertThat(result.raceSeed().deckId()).isEqualTo("tdk_1");
		assertThat(result.raceSeed().seedToken()).startsWith("v1.");
	}
}
