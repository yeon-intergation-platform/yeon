package world.yeon.backend.life_os.dto;

import java.util.List;

public record UpsertLifeOsDayRequest(
	String localDate,
	String timezone,
	String mindset,
	String backlogText,
	List<LifeOsHourEntryDto> entries
) {}
