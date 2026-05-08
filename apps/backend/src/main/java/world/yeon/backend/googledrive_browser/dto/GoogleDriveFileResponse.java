package world.yeon.backend.googledrive_browser.dto;

public record GoogleDriveFileResponse(String id, String name, int size, String lastModifiedAt, String mimeType) {}
