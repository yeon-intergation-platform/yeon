package world.yeon.backend.life_os.dto;

public record LifeOsHourEntryDto(
	int hour,
	String goalText,
	String actionText,
	String goalCategory,
	String actionCategory,
	String note
) {}
