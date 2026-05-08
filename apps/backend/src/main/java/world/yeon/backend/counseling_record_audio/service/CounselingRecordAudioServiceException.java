package world.yeon.backend.counseling_record_audio.service;

public class CounselingRecordAudioServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public CounselingRecordAudioServiceException(int status, String code, String message) {
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
