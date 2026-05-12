package world.yeon.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.Customizer;
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
			.httpBasic(Customizer.withDefaults())
			.addFilterBefore(
				new InternalServiceTokenAuthFilter(internalToken),
				BasicAuthenticationFilter.class
			)
			.authorizeHttpRequests((authorize) -> authorize
				.requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
				.requestMatchers("/api/v1/community-chat/messages", "/api/v1/community-chat/messages/**").permitAll()
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
