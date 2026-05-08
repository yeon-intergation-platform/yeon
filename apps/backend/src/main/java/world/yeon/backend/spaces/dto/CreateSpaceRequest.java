package world.yeon.backend.spaces.dto;

public record CreateSpaceRequest(
	String name,
	String description,
	String startDate,
	String endDate
) {}
