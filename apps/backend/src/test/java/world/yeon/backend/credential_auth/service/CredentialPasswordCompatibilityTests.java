package world.yeon.backend.credential_auth.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

public class CredentialPasswordCompatibilityTests {
	@Test
	void verifiesNodeRsArgon2PasswordHash() {
		Argon2PasswordEncoder encoder = new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
		String hash = "$argon2id$v=19$m=19456,t=2,p=1$Xu+TPzzniwWg9RGTAzu9Tw$uwr9XWBZfLvmf299GUvHF3rJqmo5o1hpXPsohSxtneI";

		assertThat(encoder.matches("yeon-dummy-password-for-timing-defense-only", hash)).isTrue();
	}
}
