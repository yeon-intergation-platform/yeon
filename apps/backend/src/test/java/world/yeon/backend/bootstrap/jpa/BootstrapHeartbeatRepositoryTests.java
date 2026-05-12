package world.yeon.backend.bootstrap.jpa;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@ActiveProfiles("dev.local")
@Testcontainers
class BootstrapHeartbeatRepositoryTests {

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
		.withDatabaseName("yeon_backend_test")
		.withUsername("yeon_test")
		.withPassword("yeon_test");

	@Autowired
	private BootstrapHeartbeatRepository repository;

	@DynamicPropertySource
	static void registerDatabaseProps(DynamicPropertyRegistry registry) {
		registry.add("DATABASE_URL", () -> "postgresql://" + postgres.getUsername() + ":" + postgres.getPassword() + "@" + postgres.getHost() + ":" + postgres.getFirstMappedPort() + "/" + postgres.getDatabaseName());
	}

	@Test
	void repository로DummyEntity를저장하고조회할수있다() {
		BootstrapHeartbeat entity = new BootstrapHeartbeat("bootstrap-heartbeat", "jpa-baseline-ok");

		repository.save(entity);

		BootstrapHeartbeat saved = repository.findById("bootstrap-heartbeat").orElseThrow();
		assertThat(saved.getLabel()).isEqualTo("jpa-baseline-ok");
	}
}
