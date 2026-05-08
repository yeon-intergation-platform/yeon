package world.yeon.backend.member_fields.write.service;

public class MemberFieldWriteServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public MemberFieldWriteServiceException(int status, String message, String code) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int getStatus() {
		return status;
	}

	public String getCode() {
		return code;
	}
}
