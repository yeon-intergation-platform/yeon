package world.yeon.backend.member_risk_profiles.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfileRequestItem;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfileResponseItem;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfilesRequest;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfilesResponse;
import world.yeon.backend.member_risk_profiles.service.MemberRiskProfileService;

@WebMvcTest(MemberRiskProfileController.class)
@ActiveProfiles("jdbc")
@TestPropertySource(properties = "SPRING_INTERNAL_TOKEN=test-internal-token")
class MemberRiskProfileControllerTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000972");

	@Autowired private MockMvc mockMvc;
	@MockitoBean private MemberRiskProfileService service;

	@Test void responseShape를반환한다() throws Exception {
		when(service.getProfiles(eq(OWNER_ID), eq(new MemberRiskProfilesRequest(List.of(new MemberRiskProfileRequestItem("mem_1", null))))))
			.thenReturn(new MemberRiskProfilesResponse(List.of(
				new MemberRiskProfileResponseItem("mem_1", "high", "위험 신호", List.of("지연"), "counseling_ai", 1, "2026-05-08T00:00:00Z")
			)));

		mockMvc.perform(post("/member-risk-profiles")
			.header("X-Yeon-User-Id", OWNER_ID.toString())
			.header("X-Yeon-Internal-Token", "test-internal-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"members\":[{\"id\":\"mem_1\",\"initialRiskLevel\":null}]}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.profiles[0].id").value("mem_1"))
			.andExpect(jsonPath("$.profiles[0].aiRiskLevel").value("high"));
	}
}
