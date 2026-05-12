package world.yeon.backend.card_decks.assets.service;

import java.net.URI;
import java.util.Set;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Component
public class CardDeckAssetStorage {
	private static final Set<Integer> RETRYABLE_STATUS_CODES = Set.of(408, 425, 429, 500, 502, 503, 504);
	private static final String REGION = "auto";
	private final String accountId;
	private final String accessKeyId;
	private final String secretAccessKey;
	private final String endpoint;
	private final String bucketName;
	private S3Client client;

	public CardDeckAssetStorage() {
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

	public void put(String objectKey, byte[] bytes, String contentType, String cacheControl) {
		for (int attempt = 1; attempt <= 3; attempt += 1) {
			try {
				client().putObject(
					PutObjectRequest.builder()
						.bucket(bucketName)
						.key(objectKey)
						.contentType(contentType)
						.cacheControl(cacheControl)
						.build(),
					RequestBody.fromBytes(bytes)
				);
				return;
			} catch (AwsServiceException error) {
				if (attempt == 3 || !RETRYABLE_STATUS_CODES.contains(error.statusCode())) {
					throw storageError("CARD_ASSET_UPLOAD_FAILED", "이미지를 업로드하지 못했습니다.");
				}
			} catch (SdkException error) {
				if (attempt == 3) {
					throw storageError("CARD_ASSET_UPLOAD_FAILED", "이미지를 업로드하지 못했습니다.");
				}
			} catch (RuntimeException error) {
				if (attempt == 3) {
					throw storageError("CARD_ASSET_UPLOAD_FAILED", "이미지를 업로드하지 못했습니다.");
				}
			}
		}
	}

	public StoredAsset read(String objectKey) {
		for (int attempt = 1; attempt <= 3; attempt += 1) {
			try {
				ResponseBytes<GetObjectResponse> response = client().getObjectAsBytes(
					GetObjectRequest.builder().bucket(bucketName).key(objectKey).build()
				);
				return new StoredAsset(
					response.asByteArray(),
					response.response().contentType() == null ? "application/octet-stream" : response.response().contentType(),
					response.response().cacheControl() == null ? CardDeckAssetService.IMMUTABLE_CACHE_CONTROL : response.response().cacheControl()
				);
			} catch (AwsServiceException error) {
				if (error.statusCode() == 404) {
					throw new CardDeckAssetServiceException(404, "CARD_ASSET_NOT_FOUND", "이미지를 찾지 못했습니다.");
				}
				if (attempt == 3 || !RETRYABLE_STATUS_CODES.contains(error.statusCode())) {
					throw storageError("CARD_ASSET_DOWNLOAD_FAILED", "이미지를 불러오지 못했습니다.");
				}
			} catch (SdkException error) {
				if (attempt == 3) {
					throw storageError("CARD_ASSET_DOWNLOAD_FAILED", "이미지를 불러오지 못했습니다.");
				}
			} catch (RuntimeException error) {
				if (attempt == 3) {
					throw storageError("CARD_ASSET_DOWNLOAD_FAILED", "이미지를 불러오지 못했습니다.");
				}
			}
		}
		throw storageError("CARD_ASSET_DOWNLOAD_FAILED", "이미지를 불러오지 못했습니다.");
	}

	private CardDeckAssetServiceException storageError(String code, String message) {
		return new CardDeckAssetServiceException(502, code, message);
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
			.credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
			.forcePathStyle(true)
			.build();
		return client;
	}

	private void requireConfigured(String valueName, String value, String context) {
		if (value == null) {
			throw new CardDeckAssetServiceException(500, "CARD_ASSET_STORAGE_NOT_CONFIGURED", valueName + " 환경변수가 없어 " + context + "을(를) 진행할 수 없습니다.");
		}
	}

	private String trimToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public record StoredAsset(byte[] bytes, String contentType, String cacheControl) {}
}
