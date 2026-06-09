package world.yeon.backend.card_decks.assets.service;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Set;
import org.springframework.core.env.Environment;
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
	private final boolean localFallbackEnabled;
	private final Path localFallbackDirectory;
	private S3Client client;

	public CardDeckAssetStorage(Environment environment) {
		this.accountId = trimToNull(System.getenv("R2_ACCOUNT_ID"));
		this.accessKeyId = trimToNull(System.getenv("R2_ACCESS_KEY_ID"));
		this.secretAccessKey = trimToNull(System.getenv("R2_SECRET_ACCESS_KEY"));
		this.bucketName = trimToNull(System.getenv("R2_BUCKET_NAME"));
		String configuredEndpoint = trimToNull(System.getenv("R2_ENDPOINT"));
		if (configuredEndpoint == null && accountId != null) {
			configuredEndpoint = "https://" + accountId + ".r2.cloudflarestorage.com";
		}
		this.endpoint = configuredEndpoint;
		this.localFallbackEnabled = shouldUseLocalFallback(environment);
		this.localFallbackDirectory = resolveLocalFallbackDirectory();
	}

	public void put(String objectKey, byte[] bytes, String contentType, String cacheControl) {
		if (!isRemoteStorageConfigured() && localFallbackEnabled) {
			putLocal(objectKey, bytes, contentType);
			return;
		}

		runWithRetry(StorageOperation.UPLOAD, () ->
			client().putObject(
				PutObjectRequest.builder()
					.bucket(bucketName)
					.key(objectKey)
					.contentType(contentType)
					.cacheControl(cacheControl)
					.build(),
				RequestBody.fromBytes(bytes)
			)
		);
	}

	public StoredAsset read(String objectKey) {
		if (!isRemoteStorageConfigured() && localFallbackEnabled) {
			return readLocal(objectKey);
		}

		return runWithRetry(StorageOperation.DOWNLOAD, () -> {
			ResponseBytes<GetObjectResponse> response = client().getObjectAsBytes(
				GetObjectRequest.builder().bucket(bucketName).key(objectKey).build()
			);
			return new StoredAsset(
				response.asByteArray(),
				response.response().contentType() == null ? "application/octet-stream" : response.response().contentType(),
				response.response().cacheControl() == null ? CardDeckAssetService.IMMUTABLE_CACHE_CONTROL : response.response().cacheControl()
			);
		});
	}

	private <T> T runWithRetry(StorageOperation operation, StorageAttempt<T> storageAttempt) {
		for (int attempt = 1; attempt <= operation.maxAttempts(); attempt += 1) {
			try {
				return storageAttempt.run();
			} catch (AwsServiceException error) {
				operation.awsFailureDecision(error, attempt).throwIfFailed();
			} catch (SdkException error) {
				operation.sdkFailureDecision(error, attempt).throwIfFailed();
			} catch (RuntimeException error) {
				operation.runtimeFailureDecision(error, attempt).throwIfFailed();
			}
		}

		throw operation.failure(null);
	}

	private CardDeckAssetServiceException storageError(String code, String message, Throwable cause) {
		return new CardDeckAssetServiceException(502, code, message, cause);
	}

	private boolean isRemoteStorageConfigured() {
		return accountId != null && accessKeyId != null && secretAccessKey != null && bucketName != null && endpoint != null;
	}

	private boolean shouldUseLocalFallback(Environment environment) {
		String explicit = trimToNull(System.getenv("CARD_ASSET_LOCAL_FALLBACK"));
		if (explicit != null) {
			return explicit.equalsIgnoreCase("true") || explicit.equals("1") || explicit.equalsIgnoreCase("yes");
		}

		return Arrays.stream(environment.getActiveProfiles()).anyMatch(profile ->
			profile.equalsIgnoreCase("dev.local") || profile.equalsIgnoreCase("local") || profile.equalsIgnoreCase("dev")
		);
	}

	private Path resolveLocalFallbackDirectory() {
		String configured = trimToNull(System.getenv("CARD_ASSET_LOCAL_DIR"));
		if (configured != null) {
			return Path.of(configured);
		}

		return Path.of(System.getProperty("user.home"), ".yeon", "card-assets");
	}

	private Path localPath(String objectKey) {
		Path root = localFallbackDirectory.toAbsolutePath().normalize();
		Path resolved = root.resolve(objectKey).normalize();
		if (!resolved.startsWith(root)) {
			throw new CardDeckAssetServiceException(400, "CARD_ASSET_INVALID_KEY", "이미지 경로가 올바르지 않습니다.");
		}
		return resolved;
	}

	private void putLocal(String objectKey, byte[] bytes, String contentType) {
		Path imagePath = localPath(objectKey);
		try {
			Files.createDirectories(imagePath.getParent());
			Files.write(imagePath, bytes);
			Files.writeString(imagePath.resolveSibling(imagePath.getFileName() + ".content-type"), contentType);
		} catch (IOException error) {
			throw storageError("CARD_ASSET_LOCAL_UPLOAD_FAILED", "로컬 이미지 저장소에 이미지를 저장하지 못했습니다.", error);
		}
	}

	private StoredAsset readLocal(String objectKey) {
		Path imagePath = localPath(objectKey);
		if (!Files.exists(imagePath)) {
			throw new CardDeckAssetServiceException(404, "CARD_ASSET_NOT_FOUND", "이미지를 찾지 못했습니다.");
		}

		try {
			Path contentTypePath = imagePath.resolveSibling(imagePath.getFileName() + ".content-type");
			String contentType = Files.exists(contentTypePath) ? Files.readString(contentTypePath).trim() : inferContentType(objectKey);
			return new StoredAsset(Files.readAllBytes(imagePath), contentType.isEmpty() ? "application/octet-stream" : contentType, CardDeckAssetService.IMMUTABLE_CACHE_CONTROL);
		} catch (IOException error) {
			throw storageError("CARD_ASSET_LOCAL_DOWNLOAD_FAILED", "로컬 이미지 저장소에서 이미지를 읽지 못했습니다.", error);
		}
	}

	private String inferContentType(String objectKey) {
		String normalized = objectKey.toLowerCase();
		if (normalized.endsWith(".png")) return "image/png";
		if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
		if (normalized.endsWith(".webp")) return "image/webp";
		if (normalized.endsWith(".gif")) return "image/gif";
		return "application/octet-stream";
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

	@FunctionalInterface
	private interface StorageAttempt<T> {
		T run();
	}

	private record StorageFailureDecision(CardDeckAssetServiceException failure) {
		void throwIfFailed() {
			if (failure != null) {
				throw failure;
			}
		}
	}

	private enum StorageOperation {
		UPLOAD("CARD_ASSET_UPLOAD_FAILED", "이미지를 업로드하지 못했습니다.", null),
		DOWNLOAD("CARD_ASSET_DOWNLOAD_FAILED", "이미지를 불러오지 못했습니다.", NotFoundPolicy.CARD_ASSET);

		private static final int MAX_ATTEMPTS = 3;
		private final String failureCode;
		private final String failureMessage;
		private final NotFoundPolicy notFoundPolicy;

		StorageOperation(String failureCode, String failureMessage, NotFoundPolicy notFoundPolicy) {
			this.failureCode = failureCode;
			this.failureMessage = failureMessage;
			this.notFoundPolicy = notFoundPolicy;
		}

		int maxAttempts() {
			return MAX_ATTEMPTS;
		}

		StorageFailureDecision awsFailureDecision(AwsServiceException error, int attempt) {
			if (notFoundPolicy != null && notFoundPolicy.matches(error.statusCode())) {
				return fail(notFoundPolicy.failure(error));
			}

			return retryableFailureDecision(error, attempt, RETRYABLE_STATUS_CODES.contains(error.statusCode()));
		}

		StorageFailureDecision sdkFailureDecision(SdkException error, int attempt) {
			return retryableFailureDecision(error, attempt, true);
		}

		StorageFailureDecision runtimeFailureDecision(RuntimeException error, int attempt) {
			return retryableFailureDecision(error, attempt, true);
		}

		private StorageFailureDecision retryableFailureDecision(Throwable error, int attempt, boolean retryable) {
			if (attempt >= MAX_ATTEMPTS || !retryable) {
				return fail(failure(error));
			}

			return retry();
		}

		private StorageFailureDecision retry() {
			return new StorageFailureDecision(null);
		}

		private StorageFailureDecision fail(CardDeckAssetServiceException failure) {
			return new StorageFailureDecision(failure);
		}

		private CardDeckAssetServiceException failure(Throwable cause) {
			return new CardDeckAssetServiceException(502, failureCode, failureMessage, cause);
		}
	}

	private enum NotFoundPolicy {
		CARD_ASSET(404, "CARD_ASSET_NOT_FOUND", "이미지를 찾지 못했습니다.");

		private final int status;
		private final String code;
		private final String message;

		NotFoundPolicy(int status, String code, String message) {
			this.status = status;
			this.code = code;
			this.message = message;
		}

		boolean matches(int statusCode) {
			return status == statusCode;
		}

		CardDeckAssetServiceException failure(Throwable cause) {
			return new CardDeckAssetServiceException(status, code, message, cause);
		}
	}

	public record StoredAsset(byte[] bytes, String contentType, String cacheControl) {}
}
