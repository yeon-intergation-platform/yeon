package world.yeon.backend.member_field_values.write.service;

public class MemberFieldValueWriteServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public MemberFieldValueWriteServiceException(int status, String message, String code) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() {
		return status;
	}

	public String code() {
		return code;
	}
}
