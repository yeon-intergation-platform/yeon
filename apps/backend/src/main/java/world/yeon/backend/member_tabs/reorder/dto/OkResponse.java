package world.yeon.backend.member_tabs.reorder.dto;

public record OkResponse(boolean ok) {

	public static OkResponse success() {
		return new OkResponse(true);
	}
}
