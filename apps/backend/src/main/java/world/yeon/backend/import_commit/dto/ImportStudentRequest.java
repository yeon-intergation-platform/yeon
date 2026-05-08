package world.yeon.backend.import_commit.dto;

import java.util.Map;

public record ImportStudentRequest(
	String name,
	String email,
	String phone,
	String status,
	Map<String, String> customFields
) {}
