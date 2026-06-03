package world.yeon.backend.oauth_token_security;

/**
 * OAuth 토큰 암복호 과정에서 발생하는 보호 키/암호화 실패를 전달한다.
 * 토큰 평문이 메시지에 노출되지 않도록 사유는 코드/한국어 메시지로만 표현한다.
 */
public class OAuthTokenSecretException extends RuntimeException {
	private final int status;
	private final String code;

	public OAuthTokenSecretException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() {
		return status;
	}

	public String code() {
		return code;
	}
}
