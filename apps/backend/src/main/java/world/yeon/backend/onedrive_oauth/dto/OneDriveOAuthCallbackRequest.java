package world.yeon.backend.onedrive_oauth.dto;

import jakarta.validation.constraints.NotBlank;

public record OneDriveOAuthCallbackRequest(@NotBlank String code) {}
