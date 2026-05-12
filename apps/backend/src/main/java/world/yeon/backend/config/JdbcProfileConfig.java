package world.yeon.backend.config;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class JdbcProfileConfig {

	@Bean
	DataSource dataSource(Environment environment) {
		JdbcConnectionProperties connection = resolveConnection(environment);

		return DataSourceBuilder.create()
			.url(connection.jdbcUrl())
			.username(connection.username())
			.password(connection.password())
			.driverClassName("org.postgresql.Driver")
			.build();
	}

	private JdbcConnectionProperties resolveConnection(Environment environment) {
		String backendDatabaseUrl = read(environment, "BACKEND_DATABASE_URL");
		if (backendDatabaseUrl == null) {
			backendDatabaseUrl = read(environment, "DATABASE_URL");
		}

		if (backendDatabaseUrl != null) {
			return parseDatabaseUrl(backendDatabaseUrl);
		}

		String jdbcUrl = require(environment, "BACKEND_JDBC_DATABASE_URL");
		return new JdbcConnectionProperties(
			jdbcUrl,
			read(environment, "BACKEND_JDBC_DATABASE_USERNAME"),
			read(environment, "BACKEND_JDBC_DATABASE_PASSWORD")
		);
	}

	private JdbcConnectionProperties parseDatabaseUrl(String databaseUrl) {
		try {
			java.net.URI uri = java.net.URI.create(databaseUrl);
			if (!"postgresql".equals(uri.getScheme()) && !"postgres".equals(uri.getScheme())) {
				throw new IllegalStateException("DATABASE_URL은 postgresql:// 형식이어야 합니다.");
			}

			String userInfo = uri.getUserInfo();
			String username = null;
			String password = null;
			if (userInfo != null) {
				String[] parts = userInfo.split(":", 2);
				username = decode(parts[0]);
				password = parts.length > 1 ? decode(parts[1]) : null;
			}

			String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
			String port = uri.getPort() < 0 ? "" : ":" + uri.getPort();
			String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + port + uri.getRawPath() + query;
			return new JdbcConnectionProperties(jdbcUrl, username, password);
		} catch (IllegalArgumentException error) {
			throw new IllegalStateException("DATABASE_URL 형식이 올바르지 않습니다.", error);
		}
	}

	private String decode(String value) {
		return java.net.URLDecoder.decode(value, java.nio.charset.StandardCharsets.UTF_8);
	}

	private String read(Environment environment, String key) {
		String value = environment.getProperty(key);
		return value == null || value.isBlank() ? null : value;
	}

	private String require(Environment environment, String key) {
		String value = read(environment, key);
		if (value == null || value.isBlank()) {
			throw new IllegalStateException(key + " 환경변수가 필요합니다.");
		}
		return value;
	}

	private record JdbcConnectionProperties(String jdbcUrl, String username, String password) {}
}
