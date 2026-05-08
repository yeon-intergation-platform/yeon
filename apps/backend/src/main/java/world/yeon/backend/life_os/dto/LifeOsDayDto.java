package world.yeon.backend.life_os.dto;

import java.util.List;

public record LifeOsDayDto(
	String id,
	String localDate,
	String timezone,
	String mindset,
	String backlogText,
	List<LifeOsHourEntryDto> entries,
	String createdAt,
	String updatedAt
) {}
