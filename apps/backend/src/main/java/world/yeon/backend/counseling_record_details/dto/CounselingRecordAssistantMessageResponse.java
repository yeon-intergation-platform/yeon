package world.yeon.backend.counseling_record_details.dto;

public record CounselingRecordAssistantMessageResponse(
	String id,
	String role,
	String content,
	String createdAt
) {}
