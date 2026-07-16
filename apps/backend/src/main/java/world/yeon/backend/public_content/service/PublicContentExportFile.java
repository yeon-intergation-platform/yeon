package world.yeon.backend.public_content.service;

public record PublicContentExportFile(
	String filename,
	String contentType,
	byte[] content
) {}
