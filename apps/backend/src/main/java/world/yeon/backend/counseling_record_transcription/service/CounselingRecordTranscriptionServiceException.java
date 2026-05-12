package world.yeon.backend.counseling_record_transcription.service;

public class CounselingRecordTranscriptionServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public CounselingRecordTranscriptionServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
