package world.yeon.backend.credential_auth.service;

import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.stereotype.Component;
import world.yeon.backend.root_auth.service.AuthSessionTokenGenerator;

@Component
public class AuthSessionTokenFactory implements AuthSessionTokenGenerator {
	private static final int TOKEN_BYTE_LENGTH = 32;
	private final SecureRandom secureRandom = new SecureRandom();

	@Override
	public String createToken() {
		byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
		secureRandom.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}
}
