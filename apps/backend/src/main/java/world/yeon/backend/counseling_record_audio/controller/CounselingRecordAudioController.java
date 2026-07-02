package world.yeon.backend.counseling_record_audio.controller;

import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.counseling_record_audio.service.CounselingRecordAudioService;
import world.yeon.backend.counseling_record_audio.service.CounselingRecordAudioServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@RestController
public class CounselingRecordAudioController {
	private final CounselingRecordAudioService service;

	public CounselingRecordAudioController(CounselingRecordAudioService service) {
		this.service = service;
	}

	@GetMapping("/counseling-records/{recordId}/audio")
	public ResponseEntity<byte[]> getAudio(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@PathVariable String recordId,
		@RequestHeader(value = "Range", required = false) String rangeHeader
	) {
		CounselingRecordAudioService.AudioResponse audio = service.getAudio(userId, recordId, rangeHeader);
		HttpHeaders headers = new HttpHeaders();
		headers.add("content-type", audio.mimeType());
		headers.add("content-length", String.valueOf(audio.contentLength()));
		headers.add("content-disposition", "inline; filename*=UTF-8''" + java.net.URLEncoder.encode(audio.originalName(), java.nio.charset.StandardCharsets.UTF_8));
		headers.add("cache-control", "private, no-store");
		headers.add("accept-ranges", "bytes");
		if (audio.contentRange() != null) {
			headers.add("content-range", audio.contentRange());
		}
		return new ResponseEntity<>(audio.bytes(), headers, HttpStatus.valueOf(audio.status()));
	}

	@ExceptionHandler(CounselingRecordAudioServiceException.class)
	public ResponseEntity<ApiErrorResponse> handleServiceError(CounselingRecordAudioServiceException error) {
		return ResponseEntity.status(error.status()).body(ApiErrorResponses.ofCurrentRequest(error.code(), error.getMessage()));
	}
}
