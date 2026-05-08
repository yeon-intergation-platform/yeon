package world.yeon.backend.public_check_locations.dto;

public record PublicCheckLocationResultResponse(
	String id,
	String label,
	String placeName,
	String roadAddressName,
	String addressName,
	double latitude,
	double longitude,
	String source
) {}
