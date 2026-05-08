package world.yeon.backend.member_risk_profiles.dto;

import java.util.List;

public record MemberRiskProfileResponseItem(
	String id,
	String aiRiskLevel,
	String aiRiskSummary,
	List<String> aiRiskSignals,
	String riskSource,
	int counselingRecordCount,
	String lastCounselingAt
) {}
