package world.yeon.backend.common.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import world.yeon.backend.common.request.RequestIdFilter;

@WebMvcTest(GlobalApiExceptionHandlerTests.ContractProbeController.class)
@Import({
	GlobalApiExceptionHandler.class,
	RequestIdFilter.class,
	GlobalApiExceptionHandlerTests.ContractProbeController.class
})
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class GlobalApiExceptionHandlerTests {
	private static final String REQUEST_ID = "req_test_contract";

	@Autowired private MockMvc mockMvc;

	@Test
	void 요청Id헤더가없으면생성해서본문과응답헤더에반영한다() throws Exception {
		mockMvc.perform(get("/contract/probe/param"))
			.andExpect(status().isBadRequest())
			.andExpect(header().exists(RequestIdFilter.HEADER_NAME))
			.andExpect(jsonPath("$.requestId").isNotEmpty());
	}

	@Test
	void 필수요청헤더누락은계약형코드와요청정보를반환한다() throws Exception {
		mockMvc.perform(get("/contract/probe/header").header(RequestIdFilter.HEADER_NAME, REQUEST_ID))
			.andExpect(status().isBadRequest())
			.andExpect(header().string(RequestIdFilter.HEADER_NAME, REQUEST_ID))
			.andExpect(jsonPath("$.code").value("REQUEST_HEADER_REQUIRED"))
			.andExpect(jsonPath("$.message").value("필수 요청 헤더가 누락되었습니다."))
			.andExpect(jsonPath("$.requestId").value(REQUEST_ID))
			.andExpect(jsonPath("$.details.header").value("X-Probe-User-Id"));
	}

	@Test
	void 필수요청파라미터누락은계약형코드와요청정보를반환한다() throws Exception {
		mockMvc.perform(get("/contract/probe/param").header(RequestIdFilter.HEADER_NAME, REQUEST_ID))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("REQUEST_PARAMETER_REQUIRED"))
			.andExpect(jsonPath("$.message").value("필수 요청 파라미터가 누락되었습니다."))
			.andExpect(jsonPath("$.requestId").value(REQUEST_ID))
			.andExpect(jsonPath("$.details.parameter").value("gameSlug"))
			.andExpect(jsonPath("$.details.expectedType").value("String"));
	}

	@Test
	void 요청값타입불일치는계약형코드와요청정보를반환한다() throws Exception {
		mockMvc.perform(get("/contract/probe/type/not-a-uuid").header(RequestIdFilter.HEADER_NAME, REQUEST_ID))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("REQUEST_VALUE_TYPE_INVALID"))
			.andExpect(jsonPath("$.message").value("요청 값의 형식이 올바르지 않습니다."))
			.andExpect(jsonPath("$.requestId").value(REQUEST_ID))
			.andExpect(jsonPath("$.details.name").value("id"))
			.andExpect(jsonPath("$.details.requiredType").value("UUID"))
			.andExpect(jsonPath("$.details.value").value("not-a-uuid"));
	}

	@Test
	void 본문파싱실패는계약형코드와요청Id를반환한다() throws Exception {
		mockMvc.perform(post("/contract/probe/body")
				.header(RequestIdFilter.HEADER_NAME, REQUEST_ID)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("REQUEST_BODY_INVALID"))
			.andExpect(jsonPath("$.message").value("요청 본문 형식이 올바르지 않습니다."))
			.andExpect(jsonPath("$.requestId").value(REQUEST_ID));
	}

	@Test
	void responseStatusException은상태코드기반계약형코드로정규화한다() throws Exception {
		mockMvc.perform(get("/contract/probe/status").header(RequestIdFilter.HEADER_NAME, REQUEST_ID))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("ACCESS_FORBIDDEN"))
			.andExpect(jsonPath("$.message").value("막힘"))
			.andExpect(jsonPath("$.requestId").value(REQUEST_ID));
	}

	@Test
	void apiException메타데이터는공통응답으로전달된다() throws Exception {
		mockMvc.perform(get("/contract/probe/domain-metadata").header(RequestIdFilter.HEADER_NAME, REQUEST_ID))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.code").value("CARD_ROOM_STATE_INVALID"))
			.andExpect(jsonPath("$.message").value("현재 상태에서는 제출할 수 없습니다."))
			.andExpect(jsonPath("$.requestId").value(REQUEST_ID))
			.andExpect(jsonPath("$.details.roomId").value("room_1"))
			.andExpect(jsonPath("$.currentState").value("WAITING"))
			.andExpect(jsonPath("$.requiredState").value("IN_PROGRESS"))
			.andExpect(jsonPath("$.failedCondition").value("room_started"))
			.andExpect(jsonPath("$.blockedAction").value("SUBMIT_RESULT"))
			.andExpect(jsonPath("$.actionGuide.action").value("WAIT"))
			.andExpect(jsonPath("$.actionGuide.label").value("방 시작 기다리기"));
	}

	@RestController
	public static class ContractProbeController {
		@GetMapping("/contract/probe/header")
		void requiredHeader(@RequestHeader("X-Probe-User-Id") UUID userId) {}

		@GetMapping("/contract/probe/param")
		void requiredParam(@RequestParam("gameSlug") String gameSlug) {}

		@GetMapping("/contract/probe/type/{id}")
		void pathVariableType(@PathVariable UUID id) {}

		@PostMapping("/contract/probe/body")
		void requestBody(@RequestBody ProbeBody body) {}

		@GetMapping("/contract/probe/status")
		void responseStatusException() {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "막힘");
		}

		@GetMapping("/contract/probe/domain-metadata")
		void domainMetadataException() {
			throw new ProbeStateException();
		}
	}

	static class ProbeStateException extends ApiException {
		ProbeStateException() {
			super(
				409,
				"CARD_ROOM_STATE_INVALID",
				"현재 상태에서는 제출할 수 없습니다.",
				Map.of("roomId", "room_1"),
				"WAITING",
				"IN_PROGRESS",
				"room_started",
				"SUBMIT_RESULT",
				Map.of("action", "WAIT", "label", "방 시작 기다리기")
			);
		}
	}

	record ProbeBody(String value) {}
}
