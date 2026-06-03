package world.yeon.backend.community_chat.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import world.yeon.backend.community_chat.dto.SendCommunityChatMessageRequest;
import world.yeon.backend.community_chat.repository.CommunityChatRepository;
import world.yeon.backend.community_chat.repository.CommunityChatRepository.MessageRow;
import world.yeon.backend.user_experience.domain.ExperienceActivity;
import world.yeon.backend.user_experience.service.ExperienceService;

@ExtendWith(MockitoExtension.class)
class CommunityChatServiceTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000010");
	private static final UUID MESSAGE_ID = UUID.fromString("00000000-0000-0000-0000-0000000000aa");

	@Mock private CommunityChatRepository repository;
	@Mock private ExperienceService experienceService;
	private CommunityChatService service;

	@BeforeEach
	void setUp() {
		service = new CommunityChatService(repository, experienceService);
	}

	private MessageRow messageRow(UUID senderUserId) {
		return new MessageRow(MESSAGE_ID, senderUserId, null, "닉네임", "안녕하세요", OffsetDateTime.now());
	}

	@Test
	void 로그인유저_글작성시_커뮤니티_경험치를_메시지id로_적립한다() {
		when(repository.insert(any(), eq(USER_ID), any(), anyString(), anyString())).thenReturn(messageRow(USER_ID));

		service.send(USER_ID, new SendCommunityChatMessageRequest("안녕하세요", null, "나", null));

		verify(experienceService).award(USER_ID, ExperienceActivity.COMMUNITY_POST, MESSAGE_ID.toString());
	}

	@Test
	void 게스트_글작성은_경험치를_적립하지_않는다() {
		when(repository.insert(any(), eq(null), any(), anyString(), anyString())).thenReturn(messageRow(null));

		service.send(null, new SendCommunityChatMessageRequest("안녕하세요", "guest-session-1", null, "익명이"));

		verify(experienceService, never()).award(any(), any(), anyString());
	}

	@Test
	void 경험치_적립_실패는_글작성을_깨지_않는다() {
		when(repository.insert(any(), eq(USER_ID), any(), anyString(), anyString())).thenReturn(messageRow(USER_ID));
		doThrow(new RuntimeException("적립 실패")).when(experienceService).award(any(), any(), anyString());

		// 적립이 실패해도 send 는 예외 없이 작성된 메시지를 반환해야 한다.
		var response = service.send(USER_ID, new SendCommunityChatMessageRequest("안녕하세요", null, "나", null));

		assertThat(response).isNotNull();
		assertThat(response.message().id()).isEqualTo(MESSAGE_ID);
	}

	@Test
	void 적립_referenceId는_방금_생성된_메시지id다() {
		when(repository.insert(any(), eq(USER_ID), any(), anyString(), anyString())).thenReturn(messageRow(USER_ID));

		service.send(USER_ID, new SendCommunityChatMessageRequest("안녕하세요", null, "나", null));

		ArgumentCaptor<String> referenceId = ArgumentCaptor.forClass(String.class);
		verify(experienceService).award(eq(USER_ID), eq(ExperienceActivity.COMMUNITY_POST), referenceId.capture());
		assertThat(referenceId.getValue()).isEqualTo(MESSAGE_ID.toString());
	}
}
