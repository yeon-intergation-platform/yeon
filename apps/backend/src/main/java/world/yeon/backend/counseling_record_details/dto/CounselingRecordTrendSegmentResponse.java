package world.yeon.backend.counseling_record_details.dto;

public record CounselingRecordTrendSegmentResponse(
	String speakerLabel,
	String text,
	int startMs
) {}
