package world.yeon.backend.member_fields.bootstrap_overview.dto;

public record OkResponse(boolean ok) {

	public static OkResponse success() {
		return new OkResponse(true);
	}
}
