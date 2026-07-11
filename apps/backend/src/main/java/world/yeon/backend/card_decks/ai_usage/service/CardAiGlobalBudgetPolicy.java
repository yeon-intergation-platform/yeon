package world.yeon.backend.card_decks.ai_usage.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public final class CardAiGlobalBudgetPolicy {
	static final String ENABLED_PROPERTY = "YEON_CARD_AI_ENABLED";
	static final String DAILY_REQUEST_LIMIT_PROPERTY = "YEON_CARD_AI_GLOBAL_DAILY_REQUEST_LIMIT";
	static final String DAILY_TOKEN_LIMIT_PROPERTY = "YEON_CARD_AI_GLOBAL_DAILY_TOKEN_LIMIT";
	private static final String ENABLED_DOTTED_PROPERTY = "yeon.card.ai.enabled";
	private static final String DAILY_REQUEST_LIMIT_DOTTED_PROPERTY =
		"yeon.card.ai.global.daily-request-limit";
	private static final String DAILY_TOKEN_LIMIT_DOTTED_PROPERTY =
		"yeon.card.ai.global.daily-token-limit";

	private static final Logger log = LoggerFactory.getLogger(CardAiGlobalBudgetPolicy.class);

	private final boolean enabled;
	private final long dailyRequestLimit;
	private final long dailyTokenLimit;

	@Autowired
	public CardAiGlobalBudgetPolicy(Environment environment) {
		String rawEnabled = normalized(property(environment, ENABLED_PROPERTY, ENABLED_DOTTED_PROPERTY));
		Long requestLimit = positiveLong(
			property(environment, DAILY_REQUEST_LIMIT_PROPERTY, DAILY_REQUEST_LIMIT_DOTTED_PROPERTY)
		);
		Long tokenLimit = positiveLong(
			property(environment, DAILY_TOKEN_LIMIT_PROPERTY, DAILY_TOKEN_LIMIT_DOTTED_PROPERTY)
		);
		boolean explicitlyEnabled = "true".equalsIgnoreCase(rawEnabled);
		boolean validEnabledValue = "true".equalsIgnoreCase(rawEnabled) || "false".equalsIgnoreCase(rawEnabled);

		this.enabled = explicitlyEnabled && validEnabledValue && requestLimit != null && tokenLimit != null;
		this.dailyRequestLimit = requestLimit == null ? 0 : requestLimit;
		this.dailyTokenLimit = tokenLimit == null ? 0 : tokenLimit;

		if (explicitlyEnabled && !enabled) {
			log.error(
				"카드 AI가 활성화됐지만 전역 일일 예산 설정이 없거나 올바르지 않아 fail-closed로 차단합니다."
			);
		}
	}

	CardAiGlobalBudgetPolicy(boolean enabled, long dailyRequestLimit, long dailyTokenLimit) {
		this.enabled = enabled && dailyRequestLimit > 0 && dailyTokenLimit > 0;
		this.dailyRequestLimit = Math.max(0, dailyRequestLimit);
		this.dailyTokenLimit = Math.max(0, dailyTokenLimit);
	}

	public boolean enabled() {
		return enabled;
	}

	public long dailyRequestLimit() {
		return dailyRequestLimit;
	}

	public long dailyTokenLimit() {
		return dailyTokenLimit;
	}

	private static String normalized(String value) {
		return value == null ? null : value.trim();
	}

	private static String property(
		Environment environment,
		String environmentName,
		String dottedPropertyName
	) {
		String direct = environment.getProperty(environmentName);
		return direct != null ? direct : environment.getProperty(dottedPropertyName);
	}

	private static Long positiveLong(String value) {
		String normalized = normalized(value);
		if (normalized == null || normalized.isEmpty()) return null;
		try {
			long parsed = Long.parseLong(normalized);
			return parsed > 0 ? parsed : null;
		} catch (NumberFormatException ignored) {
			return null;
		}
	}
}
