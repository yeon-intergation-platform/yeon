package world.yeon.backend.googledrive_browser.dto;

public record GoogleDriveFileResponse(String id, String name, long size, String lastModifiedAt, String mimeType) {}
