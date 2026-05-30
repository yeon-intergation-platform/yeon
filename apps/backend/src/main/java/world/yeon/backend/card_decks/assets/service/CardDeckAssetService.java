package world.yeon.backend.card_decks.assets.service;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import world.yeon.backend.card_decks.assets.dto.CardDeckAssetUploadResponse;

@Service
public class CardDeckAssetService {
	static final String IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";
	private static final Set<String> ALLOWED_CARD_IMAGE_TYPES = Set.of("image/png", "image/jpeg", "image/webp", "image/gif");
	private static final long MAX_CARD_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;
	private static final String CARD_IMAGE_STORAGE_PREFIX = "card-service/images";
	private final CardDeckAssetStorage storage;
	private final SecureRandom secureRandom = new SecureRandom();

	public CardDeckAssetService(CardDeckAssetStorage storage) {
		this.storage = storage;
	}

	public CardDeckAssetUploadResponse upload(MultipartFile file) {
		validate(file);
		String contentType = requireContentType(file);
		String storageKey = CARD_IMAGE_STORAGE_PREFIX + "/" + randomId() + "." + extensionForMimeType(contentType);
		try {
			storage.put(storageKey, file.getBytes(), contentType, IMMUTABLE_CACHE_CONTROL);
		} catch (IOException error) {
			throw new CardDeckAssetServiceException(400, "CARD_ASSET_FILE_READ_FAILED", "이미지 파일을 읽지 못했습니다.");
		}
		return new CardDeckAssetUploadResponse(storageKey, resolveImageUrl(storageKey));
	}

	public CardDeckAssetStorage.StoredAsset read(String storageKey) {
		if (storageKey == null || storageKey.isBlank()) {
			throw new CardDeckAssetServiceException(404, "CARD_ASSET_NOT_FOUND", "이미지를 찾지 못했습니다.");
		}
		return storage.read(storageKey);
	}

	private void validate(MultipartFile file) {
		String contentType = requireContentType(file);
		if (!ALLOWED_CARD_IMAGE_TYPES.contains(contentType)) {
			throw new CardDeckAssetServiceException(400, "CARD_ASSET_UNSUPPORTED_TYPE", "PNG, JPG, WEBP, GIF 이미지만 업로드할 수 있습니다.");
		}
		if (file.isEmpty() || file.getSize() <= 0) {
			throw new CardDeckAssetServiceException(400, "CARD_ASSET_EMPTY_FILE", "비어 있는 이미지 파일은 업로드할 수 없습니다.");
		}
		if (file.getSize() > MAX_CARD_IMAGE_SIZE_BYTES) {
			throw new CardDeckAssetServiceException(400, "CARD_ASSET_TOO_LARGE", "이미지는 5MB 이하만 업로드할 수 있습니다.");
		}
	}

	private String requireContentType(MultipartFile file) {
		String contentType = file.getContentType();
		return contentType == null ? "" : contentType.trim();
	}

	private String extensionForMimeType(String mimeType) {
		return switch (mimeType) {
			case "image/png" -> "png";
			case "image/jpeg" -> "jpg";
			case "image/webp" -> "webp";
			case "image/gif" -> "gif";
			default -> "bin";
		};
	}

	private String randomId() {
		byte[] bytes = new byte[16];
		secureRandom.nextBytes(bytes);
		return HexFormat.of().formatHex(bytes);
	}

	private String resolveImageUrl(String storageKey) {
		// storageKey(card-service/images/{hex}.{ext})의 '/'는 실제 경로 구분자로 남긴다.
		// URL 인코딩하면 %2F가 되어 Spring Security StrictHttpFirewall이 조회 GET을 400으로
		// 차단한다(업로드는 되지만 이미지가 안 뜨는 원인). 와일드카드(/card-decks/assets/**)가
		// 다중 세그먼트를 받으므로 안전 문자로만 이뤄진 키는 인코딩 없이 그대로 노출한다.
		return "/api/v1/card-decks/assets/" + storageKey;
	}
}
