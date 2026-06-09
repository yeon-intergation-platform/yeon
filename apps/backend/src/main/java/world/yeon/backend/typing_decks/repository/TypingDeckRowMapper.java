package world.yeon.backend.typing_decks.repository;

import org.springframework.stereotype.Component;
import world.yeon.backend.common.repository.NativeQueryRow;

@Component
public class TypingDeckRowMapper {
	public TypingDeckRepository.TypingDeckRow toTypingDeckRow(Object rawRow) {
		NativeQueryRow row = NativeQueryRow.require(rawRow, 10, "typing deck row");
		return new TypingDeckRepository.TypingDeckRow(
			row.valueAt(0).asLong(),
			row.valueAt(1).asString(),
			row.valueAt(2).asString(),
			row.valueAt(3).asString(),
			row.valueAt(4).asString(),
			row.valueAt(5).asString(),
			row.valueAt(6).asString(),
			row.valueAt(7).asString(),
			row.valueAt(8).asOffsetDateTime(),
			row.valueAt(9).asOffsetDateTime()
		);
	}

	public TypingDeckRepository.TypingDeckListRow toTypingDeckListRow(Object rawRow) {
		NativeQueryRow row = NativeQueryRow.require(rawRow, 11, "typing deck list row");
		return new TypingDeckRepository.TypingDeckListRow(
			row.valueAt(0).asLong(),
			row.valueAt(1).asString(),
			row.valueAt(2).asString(),
			row.valueAt(3).asString(),
			row.valueAt(4).asString(),
			row.valueAt(5).asString(),
			row.valueAt(6).asString(),
			row.valueAt(7).asString(),
			row.valueAt(8).asOffsetDateTime(),
			row.valueAt(9).asOffsetDateTime(),
			row.valueAt(10).asInt()
		);
	}

	public TypingDeckRepository.TypingDeckPassageRow toTypingDeckPassageRow(Object rawRow) {
		NativeQueryRow row = NativeQueryRow.require(rawRow, 10, "typing deck passage row");
		return new TypingDeckRepository.TypingDeckPassageRow(
			row.valueAt(0).asLong(),
			row.valueAt(1).asString(),
			row.valueAt(2).asLong(),
			row.valueAt(3).asString(),
			row.valueAt(4).asString(),
			row.valueAt(5).asString(),
			row.valueAt(6).asString(),
			row.valueAt(7).asInt(),
			row.valueAt(8).asOffsetDateTime(),
			row.valueAt(9).asOffsetDateTime()
		);
	}
}
