package world.yeon.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, Environment environment)
		throws Exception {
		String internalToken = resolveInternalToken(environment);

		return http
			.csrf(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable)
			.addFilterBefore(
				new InternalServiceTokenAuthFilter(internalToken),
				BasicAuthenticationFilter.class
			)
			.authorizeHttpRequests((authorize) -> authorize
				.requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
				// IDX 97 결정: community-chat 메시지 엔드포인트는 V7 마이그레이션상 공개 의도로 판단되어 permitAll 을 유지한다.
				// 인증 차단 대신 CommunityChatService 의 앱 레벨 rate limit + 입력 검증(본문/닉네임/세션 길이)으로 하드닝한다.
				.requestMatchers("/api/v1/community-chat/messages", "/api/v1/community-chat/messages/**").permitAll()
				// 내부 적립 등 내부 전용 엔드포인트는 ROLE_INTERNAL(유효한 X-Yeon-Internal-Token)만 허용한다.
				// 메서드 시큐리티는 비활성이라 URL 기반으로 신뢰 경계를 명시해, 임의 유저 적립을 차단한다.
				.requestMatchers("/api/v1/internal/**").hasRole("INTERNAL")
				// IDX 48 신뢰 경계: 위 permitAll 경로를 제외한 모든 요청은 인증을 요구한다.
				// 인증 주체는 InternalServiceTokenAuthFilter(X-Yeon-Internal-Token) 뿐이므로,
				// chat_service 컨트롤러가 신뢰하는 X-Yeon-Chat-Profile-Id 등 호출자 헤더는
				// "내부 토큰으로 인증된 BFF 만 도달할 수 있는 경로"라는 불변식 위에서만 신뢰된다.
				.anyRequest().authenticated())
			.build();
	}

	private String resolveInternalToken(Environment environment) {
		String fromProperty = environment.getProperty("SPRING_INTERNAL_TOKEN");
		if (fromProperty != null && !fromProperty.isBlank()) {
			return fromProperty;
		}

		String normalizedProperty = environment.getProperty("spring.internal.token");
		if (normalizedProperty != null && !normalizedProperty.isBlank()) {
			return normalizedProperty;
		}

		String fromEnv = System.getenv("SPRING_INTERNAL_TOKEN");
		return fromEnv == null ? "" : fromEnv;
	}
}
