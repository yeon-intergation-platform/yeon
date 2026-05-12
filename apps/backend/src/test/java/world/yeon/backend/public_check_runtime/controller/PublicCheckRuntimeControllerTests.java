package world.yeon.backend.public_check_runtime.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import world.yeon.backend.public_check_runtime.dto.*;
import world.yeon.backend.public_check_runtime.service.PublicCheckRuntimeService;

@WebMvcTest(PublicCheckRuntimeController.class)
@ActiveProfiles("dev.local")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class PublicCheckRuntimeControllerTests {
	@Autowired private MockMvc mockMvc;
	@MockitoBean private PublicCheckRuntimeService service;

	@Test void get응답shape를반환한다() throws Exception {
		when(service.getSession(eq("token123"), eq("qr"), eq(List.of("space-1:member-1"))))
			.thenReturn(new GetPublicCheckSessionResponse("space-1", new PublicCheckSessionPublicResponse("오늘 출석 체크", "attendance_and_assignment", List.of("qr"), null, false, "홍길동"), false));
		mockMvc.perform(get("/public-check-sessions/token123").header("X-Yeon-Internal-Token", "test-internal-token").param("entry", "qr").param("remembered", "space-1:member-1"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.session.rememberedMemberName").value("홍길동"));
	}

	@Test void verify응답shape를반환한다() throws Exception {
		when(service.verifyIdentity(eq("token123"), eq(new VerifyPublicCheckIdentityRequest("홍길동", "1234"))))
			.thenReturn(new VerifyPublicCheckIdentityResponse("space-1", new VerifyPublicCheckIdentityResultResponse("matched", "본인 확인이 완료되었습니다.", "홍길동"), "member-1"));
		mockMvc.perform(post("/public-check-sessions/token123/verify").header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"홍길동\",\"phoneLast4\":\"1234\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.result.verificationStatus").value("matched"));
	}

	@Test void submit응답shape를반환한다() throws Exception {
		when(service.submit(eq("token123"), org.mockito.ArgumentMatchers.any(SubmitPublicCheckRequest.class)))
			.thenReturn(new SubmitPublicCheckResponse("space-1", new SubmitPublicCheckResultResponse("matched", "출석과 과제 체크가 완료되었습니다.", "홍길동"), "member-1", false));
		mockMvc.perform(post("/public-check-sessions/token123/submit").header("X-Yeon-Internal-Token", "test-internal-token").contentType(MediaType.APPLICATION_JSON).content("{\"method\":\"qr\",\"name\":\"홍길동\",\"phoneLast4\":\"1234\",\"assignmentStatus\":\"done\",\"assignmentLink\":null,\"latitude\":null,\"longitude\":null,\"remembered\":[]}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.result.verificationStatus").value("matched"));
	}
}
