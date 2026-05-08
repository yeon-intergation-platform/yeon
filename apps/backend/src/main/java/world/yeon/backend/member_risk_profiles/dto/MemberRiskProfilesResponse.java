package world.yeon.backend.member_risk_profiles.dto;

import java.util.List;

public record MemberRiskProfilesResponse(
	List<MemberRiskProfileResponseItem> profiles
) {}
