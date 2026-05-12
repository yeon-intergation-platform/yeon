package world.yeon.backend.counseling_record_mutation.dto;

public record UpdateTranscriptSegmentRequest(
	String text,
	String speakerLabel,
	String speakerTone
) {}
