package world.yeon.backend.public_content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import world.yeon.backend.public_content.controller.PublicContentAdminController;
import world.yeon.backend.public_content.controller.PublicContentController;
import world.yeon.backend.public_content.repository.PublicContentSeedRepository;
import world.yeon.backend.public_content.service.PublicContentAdminService;
import world.yeon.backend.public_content.service.PublicContentService;
import world.yeon.backend.users.repository.UserRepository;

@SpringJUnitConfig
@ContextConfiguration(classes = {
	PublicContentSpringContextTests.TestConfig.class,
	PublicContentAdminController.class,
	PublicContentController.class,
	PublicContentAdminService.class,
	PublicContentService.class,
	PublicContentSeedRepository.class,
})
class PublicContentSpringContextTests {
	@Autowired private PublicContentController controller;
	@Autowired private PublicContentAdminController adminController;

	@Test
	void contextLoadsWithPublicContentBeans() {
		assertThat(controller).isNotNull();
		assertThat(adminController).isNotNull();
	}

	@Configuration
	static class TestConfig {
		@Bean
		ObjectMapper objectMapper() {
			return new ObjectMapper();
		}

		@Bean
		UserRepository userRepository() {
			return mock(UserRepository.class);
		}
	}
}
