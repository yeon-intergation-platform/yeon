package world.yeon.backend.common.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

@WebMvcTest(GlobalApiExceptionHandlerTests.ContractProbeController.class)
@Import({
	GlobalApiExceptionHandler.class,
	GlobalApiExceptionHandlerTests.ContractProbeController.class
})
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class GlobalApiExceptionHandlerTests {
	@Autowired private MockMvc mockMvc;

	@Test
	void 필수요청헤더누락은계약형코드를반환한다() throws Exception {
		mockMvc.perform(get("/contract/probe/header"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("REQUEST_HEADER_REQUIRED"))
			.andExpect(jsonPath("$.message").value("필수 요청 헤더가 누락되었습니다."));
	}

	@Test
	void 필수요청파라미터누락은계약형코드를반환한다() throws Exception {
		mockMvc.perform(get("/contract/probe/param"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("REQUEST_PARAMETER_REQUIRED"))
			.andExpect(jsonPath("$.message").value("필수 요청 파라미터가 누락되었습니다."));
	}

	@Test
	void 요청값타입불일치는계약형코드를반환한다() throws Exception {
		mockMvc.perform(get("/contract/probe/type/not-a-uuid"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("REQUEST_VALUE_TYPE_INVALID"))
			.andExpect(jsonPath("$.message").value("요청 값의 형식이 올바르지 않습니다."));
	}

	@Test
	void 본문파싱실패는계약형코드를반환한다() throws Exception {
		mockMvc.perform(post("/contract/probe/body")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("REQUEST_BODY_INVALID"))
			.andExpect(jsonPath("$.message").value("요청 본문 형식이 올바르지 않습니다."));
	}

	@Test
	void responseStatusException은상태코드기반계약형코드로정규화한다() throws Exception {
		mockMvc.perform(get("/contract/probe/status"))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("ACCESS_FORBIDDEN"))
			.andExpect(jsonPath("$.message").value("막힘"));
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
	}

	record ProbeBody(String value) {}
}
