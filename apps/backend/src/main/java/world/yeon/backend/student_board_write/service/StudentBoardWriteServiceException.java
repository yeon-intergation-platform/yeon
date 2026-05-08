package world.yeon.backend.student_board_write.service;

public class StudentBoardWriteServiceException extends RuntimeException {
	private final int status;
	private final String code;

	public StudentBoardWriteServiceException(int status, String code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public int status() { return status; }
	public String code() { return code; }
}
