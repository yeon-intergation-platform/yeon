package world.yeon.backend.member_risk_profiles.dto;

import java.util.List;

public record MemberRiskProfilesRequest(
	List<MemberRiskProfileRequestItem> members
) {}
