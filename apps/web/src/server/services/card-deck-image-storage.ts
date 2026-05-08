import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { ServiceError } from "./service-error";

const R2_REGION = "auto";
const CARD_IMAGE_BUCKET_DESCRIPTION = "카드 이미지 저장";
const ALLOWED_CARD_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const MAX_CARD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const CARD_IMAGE_STORAGE_PREFIX = "card-service/images";

let cachedClient: {
  cacheKey: string;
  client: S3Client;
  bucketName: string;
} | null = null;

function sanitizeRequiredEnv(
  value: string | undefined,
  envName: string,
  description: string
) {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new ServiceError(
      500,
      `${envName} 환경변수가 없어 ${description}를 처리할 수 없습니다.`
    );
  }
  return trimmed;
}

function getR2Client() {
  const accountId = sanitizeRequiredEnv(
    process.env.R2_ACCOUNT_ID,
    "R2_ACCOUNT_ID",
    "R2 저장소 연결"
  );
  const accessKeyId = sanitizeRequiredEnv(
    process.env.R2_ACCESS_KEY_ID,
    "R2_ACCESS_KEY_ID",
    "R2 업로드 인증"
  );
  const secretAccessKey = sanitizeRequiredEnv(
    process.env.R2_SECRET_ACCESS_KEY,
    "R2_SECRET_ACCESS_KEY",
    "R2 업로드 인증"
  );
  const bucketName = sanitizeRequiredEnv(
    process.env.R2_BUCKET_NAME,
    "R2_BUCKET_NAME",
    CARD_IMAGE_BUCKET_DESCRIPTION
  );
  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  const cacheKey = [accountId, accessKeyId, bucketName, endpoint].join(":");
  if (cachedClient?.cacheKey === cacheKey) {
    return cachedClient;
  }

  const client = new S3Client({
    region: R2_REGION,
    endpoint,
    forcePathStyle: false,
    credentials: { accessKeyId, secretAccessKey },
  });

  cachedClient = { cacheKey, client, bucketName };
  return cachedClient;
}

function randomId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function extensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export function resolveCardDeckImageUrl(storageKey: string | null | undefined) {
  return storageKey
    ? `/api/v1/card-decks/assets/${encodeURIComponent(storageKey)}`
    : null;
}

export function validateCardDeckImageFile(file: {
  size: number;
  type: string;
}) {
  if (!ALLOWED_CARD_IMAGE_TYPES.has(file.type)) {
    throw new ServiceError(
      400,
      "PNG, JPG, WEBP, GIF 이미지만 업로드할 수 있습니다."
    );
  }
  if (file.size <= 0) {
    throw new ServiceError(
      400,
      "비어 있는 이미지 파일은 업로드할 수 없습니다."
    );
  }
  if (file.size > MAX_CARD_IMAGE_SIZE_BYTES) {
    throw new ServiceError(400, "이미지는 5MB 이하만 업로드할 수 있습니다.");
  }
}

export async function uploadCardDeckImage(params: {
  buffer: Buffer;
  mimeType: string;
}) {
  const { client, bucketName } = getR2Client();
  const extension = extensionForMimeType(params.mimeType);
  const storageKey = `${CARD_IMAGE_STORAGE_PREFIX}/${randomId()}.${extension}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
      Body: params.buffer,
      ContentType: params.mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    storageKey,
    imageUrl: resolveCardDeckImageUrl(storageKey),
  };
}

export async function getCardDeckImageObject(storageKey: string) {
  const { client, bucketName } = getR2Client();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
    })
  );

  if (!response.Body) {
    throw new ServiceError(404, "이미지를 찾지 못했습니다.");
  }

  return {
    body: response.Body,
    contentType: response.ContentType || "application/octet-stream",
    cacheControl:
      response.CacheControl || "public, max-age=31536000, immutable",
  };
}

export async function deleteCardDeckImage(
  storageKey: string | null | undefined
) {
  if (!storageKey) {
    return;
  }

  const { client, bucketName } = getR2Client();
  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
      })
    );
  } catch (error) {
    console.error("card-deck-image-delete-failed", { storageKey, error });
  }
}
