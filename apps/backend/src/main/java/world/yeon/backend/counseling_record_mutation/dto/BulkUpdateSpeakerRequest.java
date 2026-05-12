package world.yeon.backend.counseling_record_mutation.dto;

public record BulkUpdateSpeakerRequest(
	String fromSpeakerLabel,
	String toSpeakerLabel,
	String toSpeakerTone
) {}
