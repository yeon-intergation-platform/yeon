package world.yeon.backend.public_content.repository;

public record PublicContentRevisionRecord(
	String id,
	String articleId,
	int revisionNumber,
	String title,
	String bodyMarkdown,
	String publishedAt,
	String createdBy
) {}
