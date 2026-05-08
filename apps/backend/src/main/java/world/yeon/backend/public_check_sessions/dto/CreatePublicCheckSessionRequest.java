package world.yeon.backend.public_check_sessions.dto;

import java.util.List;

public record CreatePublicCheckSessionRequest(
	String title,
	String checkMode,
	List<String> enabledMethods,
	String opensAt,
	String closesAt,
	String locationLabel,
	Double latitude,
	Double longitude,
	Integer radiusMeters
) {}
