package world.yeon.backend.counseling_record_audio.service;

import java.io.IOException;
import java.net.URI;
import java.util.Set;
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
public class CounselingRecordAudioStorage {
	private static final Set<Integer> RETRYABLE_STATUS_CODES = Set.of(408, 425, 429, 500, 502, 503, 504);
	private static final String REGION = "auto";
	private final String accountId;
	private final String accessKeyId;
	private final String secretAccessKey;
	private final String endpoint;
	private final String bucketName;
	private S3Client client;

	public CounselingRecordAudioStorage() {
		this.accountId = trimToNull(System.getenv("R2_ACCOUNT_ID"));
		this.accessKeyId = trimToNull(System.getenv("R2_ACCESS_KEY_ID"));
		this.secretAccessKey = trimToNull(System.getenv("R2_SECRET_ACCESS_KEY"));
		this.bucketName = trimToNull(System.getenv("R2_BUCKET_NAME"));
		String configuredEndpoint = trimToNull(System.getenv("R2_ENDPOINT"));
		if (configuredEndpoint == null && accountId != null) {
			configuredEndpoint = "https://" + accountId + ".r2.cloudflarestorage.com";
		}
		this.endpoint = configuredEndpoint;
	}

	public AudioObject read(String objectKey, String rangeHeader) {
		for (int attempt = 1; attempt <= 3; attempt += 1) {
			try {
				S3Client storageClient = client();
				GetObjectRequest.Builder builder = GetObjectRequest.builder()
					.bucket(bucketName)
					.key(objectKey);
				if (rangeHeader != null && !rangeHeader.isBlank()) {
					builder.range(rangeHeader);
				}
				ResponseBytes<GetObjectResponse> response = storageClient.getObjectAsBytes(builder.build());
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
				S3Client storageClient = client();
				storageClient.deleteObject(builder -> builder.bucket(bucketName).key(objectKey));
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

	private synchronized S3Client client() {
		if (client != null) {
			return client;
		}
		requireConfigured("R2_ACCOUNT_ID", accountId, "R2 저장소 연결");
		requireConfigured("R2_ACCESS_KEY_ID", accessKeyId, "R2 업로드 인증");
		requireConfigured("R2_SECRET_ACCESS_KEY", secretAccessKey, "R2 업로드 인증");
		requireConfigured("R2_BUCKET_NAME", bucketName, "R2 저장 버킷");
		requireConfigured("R2_ENDPOINT", endpoint, "R2 저장소 연결");

		client = S3Client.builder()
			.endpointOverride(URI.create(endpoint))
			.region(software.amazon.awssdk.regions.Region.of(REGION))
			.credentialsProvider(
				StaticCredentialsProvider.create(
					AwsBasicCredentials.create(accessKeyId, secretAccessKey)
				)
			)
			.forcePathStyle(true)
			.build();
		return client;
	}

	private void requireConfigured(String valueName, String value, String context) {
		if (value == null) {
			throw new IllegalStateException(valueName + " 환경변수가 없어 " + context + "을(를) 진행할 수 없습니다.");
		}
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
