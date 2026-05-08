package world.yeon.backend.counseling_record_details.service;

public class CounselingRecordDetailServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public CounselingRecordDetailServiceException(int status, String code, String message) {
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
