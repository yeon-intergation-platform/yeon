package world.yeon.backend.card_rooms.service;

import java.time.OffsetDateTime;
import java.util.List;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomCardDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomDetailDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomMessageDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomParticipantDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomResultDto;
import world.yeon.backend.card_rooms.dto.CardRoomDtos.CardRoomSummaryDto;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.CardRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.MessageRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.ParticipantRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.ResultRow;
import world.yeon.backend.card_rooms.repository.CardRoomRepository.RoomRow;

/**
 * 카드방 row→DTO 순수 매핑 전용. CardRoomService에서 row→DTO 조립부만 그대로 옮긴 것으로, repository
 * 조회는 서비스에 남기고 이 클래스는 매핑만 담당한다. DTO 필드 순서/값/null 처리는 기존과 동일하다.
 */
final class CardRoomDtoAssembler {
	private CardRoomDtoAssembler() {}

	static CardRoomSummaryDto toSummary(RoomRow row) {
		return new CardRoomSummaryDto(row.publicId(), row.title(), row.deckTitle(), row.hostLabel(), row.visibility(), row.status(), row.currentCardIndex(), row.cardCount(), row.memorizerCount(), row.checkerCount(), iso(row.createdAt()), iso(row.updatedAt()));
	}

	static CardRoomParticipantDto toParticipant(ParticipantRow row) {
		return new CardRoomParticipantDto(row.publicId(), row.nickname(), row.characterId(), row.role(), row.isHost(), row.isReady(), iso(row.joinedAt()));
	}

	static CardRoomCardDto toCard(CardRow row) {
		return new CardRoomCardDto(row.publicId(), row.frontText(), row.backText(), row.orderIndex());
	}

	static CardRoomMessageDto toMessage(MessageRow row) {
		return new CardRoomMessageDto(row.publicId(), row.senderParticipantId(), row.senderNickname(), row.content(), row.messageType(), iso(row.createdAt()));
	}

	static CardRoomResultDto toResult(ResultRow row) {
		return new CardRoomResultDto(row.publicId(), row.cardPublicId(), row.participantPublicId(), row.result(), iso(row.createdAt()));
	}

	/**
	 * detail 조립부: repository 조회 결과(row 컬렉션 + 현재 카드 결과 값)를 받아 DetailDto로 묶는다.
	 * 필드 순서/값/null 처리는 기존 CardRoomService.detail과 동일하다.
	 */
	static CardRoomDetailDto toDetail(RoomRow room, List<ParticipantRow> participantRows, List<CardRow> cardRows, List<MessageRow> messageRows, List<ResultRow> resultRows, String currentCardResult) {
		var participants = participantRows.stream().map(CardRoomDtoAssembler::toParticipant).toList();
		var messages = messageRows.stream().map(CardRoomDtoAssembler::toMessage).toList();
		var results = resultRows.stream().map(CardRoomDtoAssembler::toResult).toList();
		var cardDtos = cardRows.stream().map(CardRoomDtoAssembler::toCard).toList();
		return new CardRoomDetailDto(room.publicId(), room.title(), room.deckTitle(), room.hostLabel(), room.visibility(), room.status(), room.currentCardIndex(), room.currentCardRevealed(), currentCardResult, cardDtos.size(), room.memorizerCount(), room.checkerCount(), iso(room.createdAt()), iso(room.updatedAt()), participants, cardDtos, messages, results);
	}

	private static String iso(OffsetDateTime value) {
		return value == null ? null : value.toString();
	}
}
