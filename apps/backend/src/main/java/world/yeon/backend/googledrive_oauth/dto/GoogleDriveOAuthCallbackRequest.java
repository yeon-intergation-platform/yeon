package world.yeon.backend.googledrive_oauth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleDriveOAuthCallbackRequest(@NotBlank String code) {}
