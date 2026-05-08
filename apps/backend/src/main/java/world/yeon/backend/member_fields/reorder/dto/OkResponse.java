package world.yeon.backend.member_fields.reorder.dto;

public record OkResponse(boolean ok) {
	public static OkResponse success() {
		return new OkResponse(true);
	}
}
