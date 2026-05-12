package world.yeon.backend.root_auth.dto;

public record SocialAuthCompleteRequest(
	String provider,
	String code,
	String codeVerifier,
	String appOrigin
) {}
