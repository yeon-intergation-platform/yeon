import { convertYeonHeicImageBlobToJpegBlob } from "@yeon/ui/runtime/YeonImageConversion";
import {
  createYeonFile,
  type YeonBlob,
  type YeonFile,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

export const CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
] as const;

export const CARD_EDITOR_IMAGE_ACCEPT =
  CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS.map((extension) => `.${extension}`).join(
    ","
  );

// 백엔드 CardDeckAssetService(5MB)와 api-contract 한도에 맞춘다.
// FE가 더 크게 허용하면 업로드 후 백엔드에서 거부돼 혼란을 주므로 fail-fast로 통일.
export const CARD_EDITOR_MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const CARD_EDITOR_MAX_IMAGE_COUNT = 20;
export const CARD_EDITOR_IMAGE_MIN_WIDTH = 200;
export const CARD_EDITOR_IMAGE_DEFAULT_WIDTH = 480;
export const CARD_EDITOR_IMAGE_MAX_WIDTH = 800;
// height는 기본적으로 auto(=null)로 비율을 유지하고, Shift 비율 해제 시에만 명시값을 갖는다.
export const CARD_EDITOR_IMAGE_MIN_HEIGHT = 60;
export const CARD_EDITOR_IMAGE_MAX_HEIGHT = 1200;

const IMAGE_TAG_PATTERN = /<img\b/gi;
const IMAGE_HEADER_BYTE_LENGTH = 32;
const JPEG_EXTENSIONS = ["jpg", "jpeg"] as const;
const HEIF_LIKE_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
  "mif1",
  "msf1",
]);
const IMAGE_MIME_TO_EXT = {
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
const IMAGE_MIME_TO_EXTS = {
  "image/gif": ["gif"],
  "image/heic": ["heic"],
  "image/heif": ["heif"],
  "image/jpeg": JPEG_EXTENSIONS,
  "image/png": ["png"],
  "image/webp": ["webp"],
} as const;

type CardEditorFileLike = Pick<YeonFile, "name" | "size" | "type">;
type SupportedImageMimeType = keyof typeof IMAGE_MIME_TO_EXTS;
export type CardEditorImageUploadSide = "front" | "back";
export type CardEditorImageUploadSideState = Record<
  CardEditorImageUploadSide,
  boolean
>;
export type CardEditorImageUploadOrigin = "clipboard" | "drop" | "paste";

const CARD_EDITOR_IMAGE_UPLOAD_ORIGIN_LABELS = {
  clipboard: "클립보드 이미지",
  drop: "이미지 드롭",
  paste: "이미지 붙여넣기",
} as const;

export function isCardEditorImageUploadInProgress(
  state: CardEditorImageUploadSideState
) {
  return state.front || state.back;
}

export function updateCardEditorImageUploadSideState(
  state: CardEditorImageUploadSideState,
  side: CardEditorImageUploadSide,
  isUploading: boolean
): CardEditorImageUploadSideState {
  return state[side] === isUploading
    ? state
    : {
        ...state,
        [side]: isUploading,
      };
}

export function createCardEditorImageUploadSideStateAction(
  side: CardEditorImageUploadSide,
  isUploading: boolean
) {
  return (state: CardEditorImageUploadSideState) =>
    updateCardEditorImageUploadSideState(state, side, isUploading);
}

export function canStartCardEditorImageUpload(input: {
  itemCount: number;
  isUploading: boolean;
}) {
  return input.itemCount > 0 && !input.isUploading;
}

export function clampCardEditorImageWidth(value: number) {
  return Math.min(
    CARD_EDITOR_IMAGE_MAX_WIDTH,
    Math.max(CARD_EDITOR_IMAGE_MIN_WIDTH, Math.round(value))
  );
}

export function parseCardEditorImageWidth(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return CARD_EDITOR_IMAGE_DEFAULT_WIDTH;
  }

  return clampCardEditorImageWidth(parsed);
}

export function clampCardEditorImageHeight(value: number) {
  return Math.min(
    CARD_EDITOR_IMAGE_MAX_HEIGHT,
    Math.max(CARD_EDITOR_IMAGE_MIN_HEIGHT, Math.round(value))
  );
}

// 명시적 height(px)가 있으면 보정한 숫자를, 없거나 비정상이면 null(=비율 유지 auto)을 돌려준다.
export function parseOptionalCardEditorImageHeight(
  value: unknown
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return clampCardEditorImageHeight(parsed);
}

export function countCardEditorImages(html: string) {
  if (!html.trim()) {
    return 0;
  }

  return html.match(IMAGE_TAG_PATTERN)?.length ?? 0;
}

export function getCardEditorFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex < 0 || lastDotIndex === fileName.length - 1) {
    return "";
  }

  return fileName
    .slice(lastDotIndex + 1)
    .trim()
    .toLowerCase();
}

function normalizeImageMimeType(
  mimeType: string | undefined
): SupportedImageMimeType | undefined {
  const normalizedMimeType = mimeType?.trim().toLowerCase();

  if (normalizedMimeType && normalizedMimeType in IMAGE_MIME_TO_EXTS) {
    return normalizedMimeType as SupportedImageMimeType;
  }

  return undefined;
}

export function getCardEditorExtensionFromMime(mimeType: string) {
  const normalizedMimeType = normalizeImageMimeType(mimeType);

  return (
    (normalizedMimeType ? IMAGE_MIME_TO_EXT[normalizedMimeType] : undefined) ??
    mimeType.split("/")[1]?.toLowerCase() ??
    ""
  );
}

export function toCardEditorFileFromBlob(blob: YeonBlob, fileName: string) {
  return createYeonFile([blob], fileName, { type: blob.type });
}

export function isAllowedCardEditorImageExtension(extension: string) {
  return CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS.includes(
    extension
      .trim()
      .toLowerCase() as (typeof CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS)[number]
  );
}

export function isCardEditorImageFile(file: CardEditorFileLike) {
  if (file.type) {
    return file.type.startsWith("image/");
  }

  return isAllowedCardEditorImageExtension(
    getCardEditorFileExtension(file.name)
  );
}

export function validateCardEditorImageFile(file: CardEditorFileLike) {
  if (!isCardEditorImageFile(file)) {
    return "이미지 파일만 업로드할 수 있습니다.";
  }

  if (file.size > CARD_EDITOR_MAX_IMAGE_SIZE) {
    return "이미지는 5MB 이하만 업로드할 수 있습니다.";
  }

  const extension = getCardEditorFileExtension(file.name);
  if (extension && !isAllowedCardEditorImageExtension(extension)) {
    return "JPG, PNG, WEBP, GIF, HEIC 이미지만 업로드할 수 있습니다.";
  }

  return null;
}

export function buildCardEditorMaxImageCountError() {
  return `이미지는 카드 한 면당 최대 ${CARD_EDITOR_MAX_IMAGE_COUNT}개까지 넣을 수 있습니다.`;
}

function hasPrefix(bytes: Uint8Array, prefix: readonly number[]) {
  if (bytes.length < prefix.length) {
    return false;
  }

  return prefix.every((value, index) => bytes[index] === value);
}

function readAscii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end)).toLowerCase();
}

function getIsoBmffBrands(bytes: Uint8Array) {
  if (readAscii(bytes, 4, 8) !== "ftyp") {
    return [];
  }

  const brands = [readAscii(bytes, 8, 12)];

  for (let index = 16; index + 4 <= bytes.length; index += 4) {
    brands.push(readAscii(bytes, index, index + 4));
  }

  return brands.filter(Boolean);
}

function detectImageMimeTypeFromHeader(
  bytes: Uint8Array
): SupportedImageMimeType | undefined {
  if (hasPrefix(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  const gifHeader = readAscii(bytes, 0, 6);
  if (gifHeader === "gif87a" || gifHeader === "gif89a") {
    return "image/gif";
  }

  if (readAscii(bytes, 0, 4) === "riff" && readAscii(bytes, 8, 12) === "webp") {
    return "image/webp";
  }

  const brands = getIsoBmffBrands(bytes);
  if (!brands.some((brand) => HEIF_LIKE_BRANDS.has(brand))) {
    return undefined;
  }

  if (brands.some((brand) => brand === "mif1" || brand === "msf1")) {
    return "image/heif";
  }

  return "image/heic";
}

function replaceFileExtension(fileName: string, nextExtension: string) {
  const normalizedFileName = fileName.trim();

  if (!normalizedFileName) {
    return `image.${nextExtension}`;
  }

  const lastDotIndex = normalizedFileName.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return `${normalizedFileName}.${nextExtension}`;
  }

  return `${normalizedFileName.slice(0, lastDotIndex)}.${nextExtension}`;
}

function hasMatchingImageExtension(
  fileName: string,
  mimeType: SupportedImageMimeType
) {
  const extension = getCardEditorFileExtension(fileName);

  return (IMAGE_MIME_TO_EXTS[mimeType] as readonly string[]).includes(
    extension
  );
}

function isHeicLikeImageMimeType(
  mimeType: string | undefined
): mimeType is "image/heic" | "image/heif" {
  return mimeType === "image/heic" || mimeType === "image/heif";
}

async function convertHeicImageFileToJpeg(file: YeonFile) {
  try {
    const convertedBlob = await convertYeonHeicImageBlobToJpegBlob({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });

    if (!convertedBlob) {
      throw new Error("HEIC 변환 결과가 비어 있습니다.");
    }

    return createYeonFile(
      [convertedBlob],
      replaceFileExtension(file.name, "jpg"),
      {
        type: "image/jpeg",
        lastModified: file.lastModified,
      }
    );
  } catch (error) {
    throw new Error(
      "HEIC/HEIF 이미지를 처리하지 못했습니다. 다른 이미지로 다시 시도해 주세요.",
      { cause: error }
    );
  }
}

export async function normalizeCardEditorImageFileForUpload(file: YeonFile) {
  const detectedMimeType = detectImageMimeTypeFromHeader(
    new Uint8Array(await file.slice(0, IMAGE_HEADER_BYTE_LENGTH).arrayBuffer())
  );
  const reportedMimeType = normalizeImageMimeType(file.type);

  if (isHeicLikeImageMimeType(detectedMimeType)) {
    return convertHeicImageFileToJpeg(file);
  }

  if (!detectedMimeType && isHeicLikeImageMimeType(reportedMimeType)) {
    return convertHeicImageFileToJpeg(file);
  }

  const resolvedMimeType = detectedMimeType ?? reportedMimeType;
  if (!resolvedMimeType) {
    return file;
  }

  if (
    reportedMimeType === resolvedMimeType &&
    hasMatchingImageExtension(file.name, resolvedMimeType)
  ) {
    return file;
  }

  return createYeonFile(
    [file],
    replaceFileExtension(
      file.name,
      getCardEditorExtensionFromMime(resolvedMimeType)
    ),
    {
      type: resolvedMimeType,
      lastModified: file.lastModified,
    }
  );
}

export function getCardEditorImageNormalizationErrorMessage(
  fileName: string,
  error: unknown
) {
  if (error instanceof Error && error.message.trim()) {
    return `${fileName}: ${error.message.trim()}`;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `${fileName}: 이미지를 처리하지 못했습니다. 원인: ${error.trim()}`;
  }

  return `${fileName}: 이미지를 처리하지 못했습니다. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

function getCardEditorImageErrorCauseMessage(
  error: unknown,
  fallbackMessage: string
) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `${fallbackMessage} 원인: ${error.trim()}`;
  }

  return `${fallbackMessage} 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

export function getCardEditorImageUploadErrorMessage(
  fileName: string,
  error: unknown
) {
  return `${fileName}: ${getCardEditorImageErrorCauseMessage(
    error,
    "이미지 업로드에 실패했습니다."
  )}`;
}

export function getCardEditorPasteImageSourceErrorMessage(error: unknown) {
  return getCardEditorImageErrorCauseMessage(
    error,
    "이미지 URL을 가져올 수 없습니다."
  );
}

export function getCardEditorImageInteractionFailureMessage(
  origin: CardEditorImageUploadOrigin,
  error?: unknown
) {
  const fallbackMessage = `${CARD_EDITOR_IMAGE_UPLOAD_ORIGIN_LABELS[origin]}에 실패했습니다.`;

  if (error === undefined) {
    return fallbackMessage;
  }

  return getCardEditorImageErrorCauseMessage(error, fallbackMessage);
}
