package world.yeon.backend.common.repository;

import java.util.function.Function;

record NativeValueReader<T, R>(Class<T> type, Function<T, R> mapper) {
	R readIfSupported(Object value) {
		return type.isInstance(value) ? mapper.apply(type.cast(value)) : null;
	}
}
