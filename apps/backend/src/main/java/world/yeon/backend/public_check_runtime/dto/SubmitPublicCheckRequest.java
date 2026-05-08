package world.yeon.backend.public_check_runtime.dto;

public record SubmitPublicCheckRequest(
	String method,
	String name,
	String phoneLast4,
	String assignmentStatus,
	String assignmentLink,
	Double latitude,
	Double longitude,
	java.util.List<String> remembered
) {}
