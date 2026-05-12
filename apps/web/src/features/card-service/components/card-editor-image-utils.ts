export const CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
] as const;

export const CARD_EDITOR_IMAGE_ACCEPT =
  CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS.map((extension) => `.${extension}`).join(
    ","
  );

export const CARD_EDITOR_MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const CARD_EDITOR_MAX_IMAGE_COUNT = 20;
export const CARD_EDITOR_IMAGE_MIN_WIDTH = 200;
export const CARD_EDITOR_IMAGE_DEFAULT_WIDTH = 480;
export const CARD_EDITOR_IMAGE_MAX_WIDTH = 800;

const IMAGE_TAG_PATTERN = /<img\b/gi;

type CardEditorFileLike = Pick<File, "name" | "size" | "type">;

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
    return "이미지는 10MB 이하만 업로드할 수 있습니다.";
  }

  const extension = getCardEditorFileExtension(file.name);
  if (extension && !isAllowedCardEditorImageExtension(extension)) {
    return "JPG, PNG, WEBP, GIF 이미지만 업로드할 수 있습니다.";
  }

  return null;
}

export function buildCardEditorMaxImageCountError() {
  return `이미지는 카드 한 면당 최대 ${CARD_EDITOR_MAX_IMAGE_COUNT}개까지 넣을 수 있습니다.`;
}
