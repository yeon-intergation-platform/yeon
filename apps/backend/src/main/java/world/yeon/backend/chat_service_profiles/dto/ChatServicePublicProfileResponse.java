package world.yeon.backend.chat_service_profiles.dto;

public record ChatServicePublicProfileResponse(
	String id,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points
) {}
