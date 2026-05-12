package world.yeon.backend.counseling_record_ai.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import world.yeon.backend.counseling_record_ai.service.CounselingRecordAiService;
import world.yeon.backend.counseling_record_ai.dto.CounselingChatRequest;
import world.yeon.backend.counseling_record_ai.service.CounselingRecordAiServiceException;

@WebMvcTest(CounselingRecordAiController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class CounselingRecordAiControllerTests {
	private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000993");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private CounselingRecordAiService service;

	@Test void 상담기록분석결과를반환한다() throws Exception {
		when(service.runRecordAnalysis(eq(USER_ID), eq("cr-1"))).thenReturn(new ObjectMapper().readTree("""
			{
			  "summary":"요약",
			  "member":{"name":null,"traits":[],"emotion":"안정"},
			  "issues":[],
			  "actions":{"mentor":[],"member":[],"nextSession":[]},
			  "keywords":[],
			  "riskAssessment":{"level":"low","basis":"근거","signals":[]}
			}
		"""));

		mockMvc.perform(
			post("/counseling-records/cr-1/analyze")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.analysisResult.summary").value("요약"));
	}

	@Test void 상담채팅스트림을반환한다() throws Exception {
		doAnswer(invocation -> {
			java.io.OutputStream outputStream = invocation.getArgument(3);
			outputStream.write("data: {\"content\":\"answer\"}\n\n".getBytes(StandardCharsets.UTF_8));
			outputStream.write("data: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
			return null;
		}).when(service).streamRecordChat(eq(USER_ID), eq("cr-1"), any(CounselingChatRequest.class), any());

		MvcResult result = mockMvc.perform(
			post("/counseling-records/cr-1/chat")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.TEXT_EVENT_STREAM)
				.content("{\"messages\":[{\"role\":\"user\",\"content\":\"요약해줘\"}]}")
		)
			.andExpect(request().asyncStarted())
			.andReturn();

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(result))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
			.andExpect(content().string("data: {\"content\":\"answer\"}\n\ndata: [DONE]\n\n"));
	}

	@Test void 상담채팅기록을초기화한다() throws Exception {
		mockMvc.perform(
			delete("/counseling-records/cr-1/chat")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
		)
			.andExpect(status().isOk())
			.andExpect(content().json("{\"ok\":true}"));

		verify(service).clearRecordChat(USER_ID, "cr-1");
	}

	@Test void 추이분석스트림을반환한다() throws Exception {
		doAnswer(invocation -> {
			java.io.OutputStream outputStream = invocation.getArgument(2);
			outputStream.write("data: {\"content\":\"summary\"}\n\n".getBytes(StandardCharsets.UTF_8));
			outputStream.write("data: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
			return null;
		}).when(service).streamTrendAnalysis(eq(USER_ID), eq(List.of("cr-1")), any());

		MvcResult result = mockMvc.perform(
			post("/counseling-records/analyze-trend")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.TEXT_EVENT_STREAM)
				.content("{\"recordIds\":[\"cr-1\"]}")
		)
			.andExpect(request().asyncStarted())
			.andReturn();

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(result))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
			.andExpect(content().string("data: {\"content\":\"summary\"}\n\ndata: [DONE]\n\n"));
	}

	@Test void 서비스오류를반환한다() throws Exception {
		doThrow(new CounselingRecordAiServiceException(400, "TREND_RECORDS_EMPTY", "분석할 기록이 없습니다."))
			.when(service).streamTrendAnalysis(eq(USER_ID), eq(List.of("missing")), any());

		MvcResult result = mockMvc.perform(
			post("/counseling-records/analyze-trend")
				.header("X-Yeon-User-Id", USER_ID.toString())
				.header("X-Yeon-Internal-Token", "test-internal-token")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"recordIds\":[\"missing\"]}")
		)
			.andExpect(request().asyncStarted())
			.andReturn();

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(result))
			.andExpect(status().isBadRequest());
	}
}
