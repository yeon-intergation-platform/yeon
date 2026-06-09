package world.yeon.backend.root_auth.repository;

import org.springframework.stereotype.Component;
import world.yeon.backend.common.repository.NativeQueryRow;
import world.yeon.backend.root_auth.repository.AuthSessionRepository.IdentityRow;
import world.yeon.backend.root_auth.repository.AuthSessionRepository.SessionRow;
import world.yeon.backend.root_auth.repository.AuthSessionRepository.UserRow;

@Component
public class AuthSessionRowMapper {
	public SessionRow toSessionRow(Object row) {
		NativeQueryRow values = NativeQueryRow.require(row, 4, "auth session row");
		return new SessionRow(
			values.valueAt(0).asUuidString(),
			values.valueAt(1).asUuidString(),
			values.valueAt(2).asOffsetDateTime(),
			values.valueAt(3).asOffsetDateTime()
		);
	}

	public UserRow toUserRow(Object row) {
		NativeQueryRow values = NativeQueryRow.require(row, 7, "auth user row");
		return new UserRow(
			values.valueAt(0).asUuidString(),
			values.valueAt(1).asString(),
			values.valueAt(2).asString(),
			values.valueAt(3).asString(),
			values.valueAt(4).asOffsetDateTime(),
			values.valueAt(5).asString(),
			values.valueAt(6).asOffsetDateTime()
		);
	}

	public IdentityRow toIdentityRow(Object row) {
		NativeQueryRow values = NativeQueryRow.require(row, 7, "auth identity row");
		return new IdentityRow(
			values.valueAt(0).asUuidString(),
			values.valueAt(1).asUuidString(),
			values.valueAt(2).asString(),
			values.valueAt(3).asString(),
			values.valueAt(4).asString(),
			values.valueAt(5).asString(),
			values.valueAt(6).asString()
		);
	}
}
