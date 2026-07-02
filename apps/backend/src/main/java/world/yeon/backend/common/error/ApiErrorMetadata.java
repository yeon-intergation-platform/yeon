package world.yeon.backend.common.error;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

final class ApiErrorMetadata {
	private ApiErrorMetadata() {}

	static Map<String, Object> copyOrNull(Map<String, Object> source) {
		if (source == null || source.isEmpty()) {
			return null;
		}
		return Collections.unmodifiableMap(new LinkedHashMap<>(source));
	}
}
