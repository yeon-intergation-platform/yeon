package world.yeon.backend.student_board_write.dto;

import com.fasterxml.jackson.annotation.JsonSetter;

public class UpdateStudentBoardRequest {
	private String attendanceStatus;
	private String assignmentStatus;
	private String assignmentLink;
	private boolean attendanceStatusPresent;
	private boolean assignmentStatusPresent;
	private boolean assignmentLinkPresent;

	public String attendanceStatus() { return attendanceStatus; }
	public String assignmentStatus() { return assignmentStatus; }
	public String assignmentLink() { return assignmentLink; }
	public boolean hasAttendanceStatus() { return attendanceStatusPresent; }
	public boolean hasAssignmentStatus() { return assignmentStatusPresent; }
	public boolean hasAssignmentLink() { return assignmentLinkPresent; }

	@JsonSetter("attendanceStatus")
	public void setAttendanceStatus(String attendanceStatus) {
		this.attendanceStatusPresent = true;
		this.attendanceStatus = attendanceStatus;
	}

	@JsonSetter("assignmentStatus")
	public void setAssignmentStatus(String assignmentStatus) {
		this.assignmentStatusPresent = true;
		this.assignmentStatus = assignmentStatus;
	}

	@JsonSetter("assignmentLink")
	public void setAssignmentLink(String assignmentLink) {
		this.assignmentLinkPresent = true;
		this.assignmentLink = assignmentLink;
	}
}
