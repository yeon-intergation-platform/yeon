package world.yeon.backend.card_decks.assets.controller;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import world.yeon.backend.card_decks.assets.dto.CardDeckAssetUploadResponse;
import world.yeon.backend.card_decks.assets.service.CardDeckAssetService;
import world.yeon.backend.card_decks.assets.service.CardDeckAssetStorage;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class CardDeckAssetController {
	private static final String ASSET_PATH_PREFIX = "/card-decks/assets/";
	private final CardDeckAssetService service;

	public CardDeckAssetController(CardDeckAssetService service) {
		this.service = service;
	}

	@PostMapping(path = "/card-decks/assets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<CardDeckAssetUploadResponse> upload(@RequestParam("file") MultipartFile file) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.upload(file));
	}

	@GetMapping("/card-decks/assets/**")
	public ResponseEntity<byte[]> read(HttpServletRequest request) {
		CardDeckAssetStorage.StoredAsset asset = service.read(resolveStorageKey(request));
		HttpHeaders headers = new HttpHeaders();
		headers.add("content-type", asset.contentType());
		headers.add("cache-control", asset.cacheControl());
		return new ResponseEntity<>(asset.bytes(), headers, HttpStatus.OK);
	}

	private String resolveStorageKey(HttpServletRequest request) {
		String uri = request.getRequestURI();
		int index = uri.indexOf(ASSET_PATH_PREFIX);
		String encoded = index >= 0 ? uri.substring(index + ASSET_PATH_PREFIX.length()) : "";
		return URLDecoder.decode(encoded, StandardCharsets.UTF_8);
	}

	public record ErrorResponse(String code, String message) {}
}
