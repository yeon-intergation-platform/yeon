package world.yeon.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class JdbcProfileConfigUnitTests {

	private final JdbcProfileConfig config = new JdbcProfileConfig();

	@Test
	void postgres_password를_단일_원천으로_연결정보를_구성한다() {
		MockEnvironment environment = new MockEnvironment()
			.withProperty("POSTGRES_HOST", "db")
			.withProperty("POSTGRES_PORT", "5432")
			.withProperty("POSTGRES_DB", "yeon")
			.withProperty("POSTGRES_USER", "yeon")
			.withProperty("POSTGRES_PASSWORD", "secret-password");

		JdbcProfileConfig.JdbcConnectionProperties connection = config.resolveConnection(environment);

		assertThat(connection.jdbcUrl()).isEqualTo("jdbc:postgresql://db:5432/yeon");
		assertThat(connection.username()).isEqualTo("yeon");
		assertThat(connection.password()).isEqualTo("secret-password");
	}

	@Test
	void 기존_database_url_계약은_로컬과_테스트_호환을_위해_유지한다() {
		MockEnvironment environment = new MockEnvironment()
			.withProperty("DATABASE_URL", "postgresql://user:password@localhost:5432/database");

		JdbcProfileConfig.JdbcConnectionProperties connection = config.resolveConnection(environment);

		assertThat(connection.jdbcUrl()).isEqualTo("jdbc:postgresql://localhost:5432/database");
		assertThat(connection.username()).isEqualTo("user");
		assertThat(connection.password()).isEqualTo("password");
	}

	@Test
	void 운영에서는_중복_비밀번호_원천인_database_url을_거부한다() {
		MockEnvironment environment = new MockEnvironment()
			.withProperty("DATABASE_URL", "postgresql://user:password@localhost:5432/database");
		environment.setActiveProfiles("prod");

		assertThatThrownBy(() -> config.resolveConnection(environment))
			.isInstanceOf(IllegalStateException.class)
			.hasMessage("prod profile에서는 DATABASE_URL을 사용할 수 없습니다.");
	}

	@Test
	void database_url과_postgres_설정이_모두_없으면_즉시_실패한다() {
		assertThatThrownBy(() -> config.resolveConnection(new MockEnvironment()))
			.isInstanceOf(IllegalStateException.class)
			.hasMessage("POSTGRES_HOST 환경변수가 필요합니다.");
	}
}
