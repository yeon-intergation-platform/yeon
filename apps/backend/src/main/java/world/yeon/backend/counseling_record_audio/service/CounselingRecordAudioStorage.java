package world.yeon.backend.counseling_record_audio.service;

import java.io.IOException;
import java.net.URI;
import java.util.Set;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

@Component
@Profile("jdbc")
public class CounselingRecordAudioStorage {
	private static final Set<Integer> RETRYABLE_STATUS_CODES = Set.of(408, 425, 429, 500, 502, 503, 504);
	private static final String REGION = "auto";
	private final S3Client client;
	private final String bucketName;

	public CounselingRecordAudioStorage() {
		String accountId = requireEnv("R2_ACCOUNT_ID", "R2 저장소 연결");
		String accessKeyId = requireEnv("R2_ACCESS_KEY_ID", "R2 업로드 인증");
		String secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY", "R2 업로드 인증");
		this.bucketName = requireEnv("R2_BUCKET_NAME", "R2 저장 버킷");
		String endpoint = trimToNull(System.getenv("R2_ENDPOINT"));
		if (endpoint == null) {
			endpoint = "https://" + accountId + ".r2.cloudflarestorage.com";
		}

		this.client = S3Client.builder()
			.endpointOverride(URI.create(endpoint))
			.region(software.amazon.awssdk.regions.Region.of(REGION))
			.credentialsProvider(
				StaticCredentialsProvider.create(
					AwsBasicCredentials.create(accessKeyId, secretAccessKey)
				)
			)
			.forcePathStyle(true)
			.build();
	}

	public AudioObject read(String objectKey, String rangeHeader) {
		for (int attempt = 1; attempt <= 3; attempt += 1) {
			try {
				GetObjectRequest.Builder builder = GetObjectRequest.builder()
					.bucket(bucketName)
					.key(objectKey);
				if (rangeHeader != null && !rangeHeader.isBlank()) {
					builder.range(rangeHeader);
				}
				ResponseBytes<GetObjectResponse> response = client.getObjectAsBytes(builder.build());
				return new AudioObject(
					response.asByteArray(),
					response.response().contentLength(),
					response.response().contentRange()
				);
			} catch (AwsServiceException error) {
				int statusCode = error.statusCode();
				if (attempt == 3 || !RETRYABLE_STATUS_CODES.contains(statusCode)) {
					throw new CounselingRecordAudioServiceException(502, "AUDIO_STORAGE_ERROR", "상담 음성 다운로드에 실패했습니다.");
				}
			} catch (SdkException error) {
				if (attempt == 3) {
					throw new CounselingRecordAudioServiceException(502, "AUDIO_STORAGE_ERROR", "상담 음성 다운로드에 실패했습니다.");
				}
			} catch (RuntimeException error) {
				if (attempt == 3) {
					throw new CounselingRecordAudioServiceException(502, "AUDIO_STORAGE_ERROR", "상담 음성 다운로드에 실패했습니다.");
				}
			}
		}
		throw new CounselingRecordAudioServiceException(502, "AUDIO_STORAGE_ERROR", "상담 음성 다운로드에 실패했습니다.");
	}

	public void delete(String objectKey) {
		for (int attempt = 1; attempt <= 3; attempt += 1) {
			try {
				client.deleteObject(builder -> builder.bucket(bucketName).key(objectKey));
				return;
			} catch (AwsServiceException error) {
				if (attempt == 3 || !RETRYABLE_STATUS_CODES.contains(error.statusCode())) {
					throw new CounselingRecordAudioServiceException(502, "AUDIO_STORAGE_DELETE_ERROR", "상담 음성 정리에 실패했습니다.");
				}
			} catch (SdkException error) {
				if (attempt == 3) {
					throw new CounselingRecordAudioServiceException(502, "AUDIO_STORAGE_DELETE_ERROR", "상담 음성 정리에 실패했습니다.");
				}
			}
		}
	}

	private String requireEnv(String valueName, String context) {
		String value = trimToNull(System.getenv(valueName));
		if (value == null) {
			throw new IllegalStateException(valueName + " 환경변수가 없어 " + context + "을(를) 진행할 수 없습니다.");
		}
		return value;
	}

	private String trimToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public record AudioObject(byte[] bytes, Long contentLength, String contentRange) {}
}
