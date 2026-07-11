package world.yeon.backend.card_decks.ai_usage.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class CardAiGlobalBudgetPolicyTests {
	@Test void 스프링점표기프로퍼티를운영전역예산으로읽는다() {
		var environment = new MockEnvironment()
			.withProperty("yeon.card.ai.enabled", "true")
			.withProperty("yeon.card.ai.global.daily-request-limit", "1000")
			.withProperty("yeon.card.ai.global.daily-token-limit", "5000000");

		var policy = new CardAiGlobalBudgetPolicy(environment);

		assertThat(policy.enabled()).isTrue();
		assertThat(policy.dailyRequestLimit()).isEqualTo(1000);
		assertThat(policy.dailyTokenLimit()).isEqualTo(5_000_000);
	}

	@Test void 예산설정이누락된활성화요청은failClosed로차단한다() {
		var environment = new MockEnvironment()
			.withProperty(CardAiGlobalBudgetPolicy.ENABLED_PROPERTY, "true");

		var policy = new CardAiGlobalBudgetPolicy(environment);

		assertThat(policy.enabled()).isFalse();
	}
}
