package world.yeon.backend.common.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

public record NativeQueryValue(Object value, String label) {
	private static final List<NativeValueReader<?, String>> UUID_VALUE_READERS = List.of(
		new NativeValueReader<>(UUID.class, UUID::toString)
	);

	private static final List<NativeValueReader<?, Long>> LONG_VALUE_READERS = List.of(
		new NativeValueReader<>(Number.class, Number::longValue)
	);

	private static final List<NativeValueReader<?, Integer>> INT_VALUE_READERS = List.of(
		new NativeValueReader<>(Number.class, Number::intValue)
	);

	private static final List<NativeValueReader<?, OffsetDateTime>> TIME_VALUE_READERS = List.of(
		new NativeValueReader<>(OffsetDateTime.class, Function.identity()),
		new NativeValueReader<>(Timestamp.class, value -> value.toInstant().atOffset(ZoneOffset.UTC)),
		new NativeValueReader<>(Instant.class, value -> value.atOffset(ZoneOffset.UTC)),
		new NativeValueReader<>(Date.class, value -> value.toInstant().atOffset(ZoneOffset.UTC)),
		new NativeValueReader<>(LocalDateTime.class, value -> value.atOffset(ZoneOffset.UTC)),
		new NativeValueReader<>(ZonedDateTime.class, ZonedDateTime::toOffsetDateTime)
	);

	public String asString() {
		return value == null ? null : value.toString();
	}

	public String asUuidString() {
		if (value == null) {
			return null;
		}
		for (NativeValueReader<?, String> reader : UUID_VALUE_READERS) {
			String converted = reader.readIfSupported(value);
			if (converted != null) {
				return converted;
			}
		}
		return value.toString();
	}

	public Long asLong() {
		if (value == null) {
			return null;
		}
		for (NativeValueReader<?, Long> reader : LONG_VALUE_READERS) {
			Long converted = reader.readIfSupported(value);
			if (converted != null) {
				return converted;
			}
		}
		return Long.parseLong(value.toString());
	}

	public int asInt() {
		if (value == null) {
			return 0;
		}
		for (NativeValueReader<?, Integer> reader : INT_VALUE_READERS) {
			Integer converted = reader.readIfSupported(value);
			if (converted != null) {
				return converted;
			}
		}
		return Integer.parseInt(value.toString());
	}

	public OffsetDateTime asOffsetDateTime() {
		if (value == null) {
			return null;
		}
		for (NativeValueReader<?, OffsetDateTime> reader : TIME_VALUE_READERS) {
			OffsetDateTime converted = reader.readIfSupported(value);
			if (converted != null) {
				return converted;
			}
		}
		return OffsetDateTime.parse(value.toString());
	}
}
