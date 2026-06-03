package world.yeon.backend.oauth_token_security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class OAuthTokenSecretProtectorTests {
	private OAuthTokenSecretProtector protector() {
		MockEnvironment environment = new MockEnvironment();
		environment.setProperty("AUTH_SECRET", "test-oauth-token-secret");
		return new OAuthTokenSecretProtector(environment);
	}

	@Test void protect후reveal하면원본을복원한다() {
		OAuthTokenSecretProtector protector = protector();
		String token = "ya29.a0ARefreshOrAccessToken-VALUE_123";

		String ciphertext = protector.protect(token);

		assertThat(ciphertext).startsWith("v1:");
		assertThat(ciphertext).doesNotContain(token);
		assertThat(protector.reveal(ciphertext)).isEqualTo(token);
	}

	@Test void 같은평문도매번다른ciphertext를만든다() {
		OAuthTokenSecretProtector protector = protector();

		String first = protector.protect("same-token");
		String second = protector.protect("same-token");

		assertThat(first).isNotEqualTo(second);
		assertThat(protector.reveal(first)).isEqualTo("same-token");
		assertThat(protector.reveal(second)).isEqualTo("same-token");
	}

	@Test void null이나빈ciphertext는null로reveal된다() {
		OAuthTokenSecretProtector protector = protector();

		assertThat(protector.reveal(null)).isNull();
		assertThat(protector.reveal("")).isNull();
		assertThat(protector.reveal("   ")).isNull();
	}

	@Test void protect는null을그대로통과시킨다() {
		assertThat(protector().protect(null)).isNull();
	}

	@Test void 손상된봉투는복호화실패예외를던진다() {
		OAuthTokenSecretProtector protector = protector();

		assertThatThrownBy(() -> protector.reveal("v1:not-base64:not-base64"))
			.isInstanceOf(OAuthTokenSecretException.class);
	}

	@Test void 다른키로만든ciphertext는복호화되지않는다() {
		MockEnvironment otherEnv = new MockEnvironment();
		otherEnv.setProperty("AUTH_SECRET", "different-secret");
		OAuthTokenSecretProtector other = new OAuthTokenSecretProtector(otherEnv);

		String ciphertext = other.protect("token");

		assertThatThrownBy(() -> protector().reveal(ciphertext))
			.isInstanceOf(OAuthTokenSecretException.class);
	}
}
