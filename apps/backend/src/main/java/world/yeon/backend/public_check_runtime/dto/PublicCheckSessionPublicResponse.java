package world.yeon.backend.public_check_runtime.dto;

import java.util.List;

public record PublicCheckSessionPublicResponse(
	String title,
	String checkMode,
	List<String> enabledMethods,
	String locationLabel,
	boolean requiresPhoneLast4,
	String rememberedMemberName
) {}
