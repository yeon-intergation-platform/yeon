package world.yeon.backend.config;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

@Configuration
@Profile("jdbc")
public class JdbcProfileConfig {

	@Bean
	DataSource dataSource(Environment environment) {
		String url = require(environment, "BACKEND_JDBC_DATABASE_URL");
		String username = environment.getProperty("BACKEND_JDBC_DATABASE_USERNAME");
		String password = environment.getProperty("BACKEND_JDBC_DATABASE_PASSWORD");

		return DataSourceBuilder.create()
			.url(url)
			.username(username)
			.password(password)
			.driverClassName("org.postgresql.Driver")
			.build();
	}

	private String require(Environment environment, String key) {
		String value = environment.getProperty(key);
		if (value == null || value.isBlank()) {
			throw new IllegalStateException(key + " 환경변수가 필요합니다.");
		}
		return value;
	}
}
