package world.yeon.backend.spaces.dto;

public record OkResponse(
	boolean ok
) {
	public static OkResponse success() {
		return new OkResponse(true);
	}
}
