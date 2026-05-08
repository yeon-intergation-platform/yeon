package world.yeon.backend.member_tabs.reset.dto;

public record OkResponse(boolean ok) {

	public static OkResponse success() {
		return new OkResponse(true);
	}
}
