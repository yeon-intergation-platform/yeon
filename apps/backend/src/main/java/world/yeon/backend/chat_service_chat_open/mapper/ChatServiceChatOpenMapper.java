package world.yeon.backend.chat_service_chat_open.mapper;

import world.yeon.backend.chat_service_chat_open.dto.ChatServiceOpenChatProfileSummaryResponse;
import world.yeon.backend.chat_service_chat_open.dto.ChatServiceOpenChatResponse;
import world.yeon.backend.chat_service_chat_open.dto.ChatServiceOpenChatRoomResponse;
import world.yeon.backend.chat_service_chat_open.repository.ChatServiceChatOpenRepository;

public final class ChatServiceChatOpenMapper {
	private ChatServiceChatOpenMapper() {}

	public static ChatServiceOpenChatResponse toResponse(ChatServiceChatOpenRepository.ChatRoomSummaryRow row) {
		return new ChatServiceOpenChatResponse(
			new ChatServiceOpenChatRoomResponse(
				row.roomId(),
				new ChatServiceOpenChatProfileSummaryResponse(
					row.peerId(),
					row.peerNickname(),
					row.peerAgeLabel(),
					row.peerRegionLabel(),
					row.peerAvatarUrl(),
					row.peerBio(),
					row.peerPoints()
				),
				row.lastMessagePreview(),
				row.lastMessageAt(),
				0,
				row.unlockedByPayment()
			)
		);
	}
}
