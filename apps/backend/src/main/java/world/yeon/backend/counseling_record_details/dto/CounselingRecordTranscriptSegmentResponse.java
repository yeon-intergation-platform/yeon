package world.yeon.backend.counseling_record_details.dto;

public record CounselingRecordTranscriptSegmentResponse(
	String id,
	int segmentIndex,
	Integer startMs,
	Integer endMs,
	String speakerLabel,
	String speakerTone,
	String text
) {}
