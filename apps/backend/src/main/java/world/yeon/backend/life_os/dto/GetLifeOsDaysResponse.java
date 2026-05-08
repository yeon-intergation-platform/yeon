package world.yeon.backend.life_os.dto;

import java.util.List;

public record GetLifeOsDaysResponse(
	List<LifeOsDayDto> days
) {}
