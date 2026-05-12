package world.yeon.backend.root_auth.dto;

import java.util.List;

public record DevLoginOptionResponse(
	String accountKey,
	String email,
	String displayName,
	List<String> providers
) {}
