package world.yeon.backend.credential_auth.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.stereotype.Component;

@Component
public class CredentialEmailRateLimiter {
	private static final long WINDOW_MILLIS = 60_000L;
	private static final int LIMIT_PER_MINUTE = 5;
	private final Map<String, List<Long>> buckets = new ConcurrentHashMap<>();

	public boolean isRateLimited(String ipAddress) {
		long now = Instant.now().toEpochMilli();
		long since = now - WINDOW_MILLIS;
		AtomicBoolean limited = new AtomicBoolean(false);

		buckets.compute(ipAddress, (key, values) -> {
			List<Long> recent = values == null ? new ArrayList<>() : new ArrayList<>(values.stream().filter(timestamp -> timestamp > since).toList());
			if (recent.size() >= LIMIT_PER_MINUTE) {
				limited.set(true);
				return recent;
			}
			recent.add(now);
			return recent;
		});

		return limited.get();
	}
}
