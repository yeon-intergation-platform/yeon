package world.yeon.backend.onedrive_browser.dto;

public record OneDriveFileResponse(String id, String name, int size, String lastModifiedAt, String mimeType) {}
