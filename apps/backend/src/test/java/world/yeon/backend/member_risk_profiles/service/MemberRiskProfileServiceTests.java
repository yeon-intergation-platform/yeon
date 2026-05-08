package world.yeon.backend.member_risk_profiles.service;

import static org.assertj.core.api.Assertions.assertThat;
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
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfileRequestItem;
import world.yeon.backend.member_risk_profiles.dto.MemberRiskProfilesRequest;
import world.yeon.backend.member_risk_profiles.repository.MemberRiskProfileRepository;

@ExtendWith(MockitoExtension.class)
class MemberRiskProfileServiceTests {
	private static final UUID OWNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000971");

	@Mock private MemberRiskProfileRepository repository;
	private MemberRiskProfileService service;

	@BeforeEach void setUp() {
		service = new MemberRiskProfileService(repository);
	}

	@Test void riskAssessment가있으면그값을우선한다() {
		when(repository.findRiskRecordsByMemberIds(eq(OWNER_ID), eq(List.of("mem_1")))).thenReturn(List.of(
			new MemberRiskProfileRepository.MemberRiskRecordRow(
				"mem_1",
				"{\"riskAssessment\":{\"level\":\"high\",\"basis\":\"위험 신호\",\"signals\":[\"지연\",\"결석\"]}}",
				"audio_upload",
				"uploads/file.mp3",
				OffsetDateTime.parse("2026-05-08T00:00:00Z")
			)
		));
		var result = service.getProfiles(OWNER_ID, new MemberRiskProfilesRequest(List.of(new MemberRiskProfileRequestItem("mem_1", null))));
		assertThat(result.profiles()).hasSize(1);
		assertThat(result.profiles().getFirst().aiRiskLevel()).isEqualTo("high");
		assertThat(result.profiles().getFirst().riskSource()).isEqualTo("counseling_ai");
	}

	@Test void record가없으면manualfallback을쓴다() {
		when(repository.findRiskRecordsByMemberIds(eq(OWNER_ID), eq(List.of("mem_1")))).thenReturn(List.of());
		var result = service.getProfiles(OWNER_ID, new MemberRiskProfilesRequest(List.of(new MemberRiskProfileRequestItem("mem_1", "medium"))));
		assertThat(result.profiles().getFirst().aiRiskLevel()).isNull();
		assertThat(result.profiles().getFirst().riskSource()).isEqualTo("manual");
	}

	@Test void demoPlaceholder는제외한다() {
		when(repository.findRiskRecordsByMemberIds(eq(OWNER_ID), eq(List.of("mem_1")))).thenReturn(List.of(
			new MemberRiskProfileRepository.MemberRiskRecordRow(
				"mem_1",
				"{\"summary\":\"중도 포기 위험\"}",
				"demo_placeholder",
				"demo-placeholder/file.mp3",
				OffsetDateTime.parse("2026-05-08T00:00:00Z")
			)
		));
		var result = service.getProfiles(OWNER_ID, new MemberRiskProfilesRequest(List.of(new MemberRiskProfileRequestItem("mem_1", null))));
		assertThat(result.profiles().getFirst().counselingRecordCount()).isEqualTo(0);
	}
}
