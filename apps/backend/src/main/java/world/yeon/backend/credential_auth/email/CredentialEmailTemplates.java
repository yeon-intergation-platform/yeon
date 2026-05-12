package world.yeon.backend.credential_auth.email;

import java.net.URI;
import org.springframework.stereotype.Component;

@Component
public class CredentialEmailTemplates {
	private static final String WRAPPER_STYLE = "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #0f172a;";
	private static final String BUTTON_STYLE = "display: inline-block; padding: 12px 20px; background: #1d4ed8; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;";
	private static final String MUTED_STYLE = "color: #64748b; font-size: 13px; line-height: 1.6;";

	public EmailMessage verification(String token, String appOrigin) {
		String verifyUrl = URI.create(normalizeOrigin(appOrigin) + "/api/auth/credentials/verify?token=" + token).toString();
		String html = """
			<div style=\"%s\">
			  <h1 style=\"font-size: 20px; margin: 0 0 16px;\">이메일 주소 확인</h1>
			  <p style=\"font-size: 15px; line-height: 1.6;\">yeon 계정 가입을 완료하려면 아래 버튼을 눌러 이메일 주소를 확인해 주세요.</p>
			  <p style=\"margin: 24px 0;\"><a href=\"%s\" style=\"%s\">이메일 인증하기</a></p>
			  <p style=\"%s\">버튼이 작동하지 않으면 아래 링크를 브라우저에 붙여넣어 주세요.<br />%s</p>
			  <hr style=\"border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;\" />
			  <p style=\"%s\">이 링크는 24시간 후 만료됩니다. 본인이 요청하지 않았다면 이 메일은 무시해 주세요.</p>
			</div>
			""".formatted(WRAPPER_STYLE, verifyUrl, BUTTON_STYLE, MUTED_STYLE, verifyUrl, MUTED_STYLE);
		return new EmailMessage("[yeon] 이메일 주소를 확인해 주세요", html);
	}

	public EmailMessage passwordReset(String token, String appOrigin) {
		String resetUrl = URI.create(normalizeOrigin(appOrigin) + "/auth/reset-password?token=" + token).toString();
		String html = """
			<div style=\"%s\">
			  <h1 style=\"font-size: 20px; margin: 0 0 16px;\">비밀번호 재설정</h1>
			  <p style=\"font-size: 15px; line-height: 1.6;\">비밀번호 재설정을 요청하셨습니다. 아래 버튼을 눌러 새 비밀번호를 설정해 주세요.</p>
			  <p style=\"margin: 24px 0;\"><a href=\"%s\" style=\"%s\">비밀번호 재설정</a></p>
			  <p style=\"%s\">버튼이 작동하지 않으면 아래 링크를 브라우저에 붙여넣어 주세요.<br />%s</p>
			  <hr style=\"border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;\" />
			  <p style=\"%s\">이 링크는 1시간 후 만료되며, 본인이 요청하지 않았다면 이 메일은 무시해도 안전합니다. 비밀번호는 재설정 완료 전까지 변경되지 않습니다.</p>
			</div>
			""".formatted(WRAPPER_STYLE, resetUrl, BUTTON_STYLE, MUTED_STYLE, resetUrl, MUTED_STYLE);
		return new EmailMessage("[yeon] 비밀번호 재설정 안내", html);
	}

	private String normalizeOrigin(String appOrigin) {
		if (appOrigin == null || appOrigin.isBlank()) {
			return "https://yeon.world";
		}
		return appOrigin.replaceAll("/+$", "");
	}

	public record EmailMessage(String subject, String html) {}
}
