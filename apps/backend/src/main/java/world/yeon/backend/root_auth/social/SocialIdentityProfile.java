package world.yeon.backend.root_auth.social;

public record SocialIdentityProfile(
	String provider,
	String providerUserId,
	String email,
	boolean emailVerified,
	String displayName,
	String avatarUrl
) {}
