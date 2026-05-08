package world.yeon.backend.spaces.dto;

public record UpdateSpaceRequest(
	String name,
	String startDate,
	String endDate
) {}
