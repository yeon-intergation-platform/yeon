"use client";

import { type Editor } from "@tiptap/react";
import { useCallback, useState } from "react";

import { uploadCardDeckImage } from "../card-service-fetch";
import {
  CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
  CARD_EDITOR_MAX_IMAGE_COUNT,
  buildCardEditorMaxImageCountError,
  countCardEditorImages,
  isCardEditorImageFile,
  validateCardEditorImageFile,
} from "./card-editor-image-utils";

function insertCardEditorImage(editor: Editor, imageUrl: string) {
  editor
    .chain()
    .focus()
    .insertContent({
      type: "image",
      attrs: {
        src: imageUrl,
        width: CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
      },
    })
    .run();
}

function toUniqueImageFiles(files: File[]) {
  const seen = new Set<string>();

  return files.filter((file) => {
    if (!isCardEditorImageFile(file)) {
      return false;
    }

    const key = `${file.name}:${file.size}:${file.type}:${file.lastModified}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function extractCardEditorImageFiles(dataTransfer: DataTransfer) {
  const files = Array.from(dataTransfer.files);

  const itemFiles = Array.from(dataTransfer.items)
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));

  return toUniqueImageFiles([...files, ...itemFiles]);
}

async function readClipboardImageFiles() {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof navigator.clipboard.read !== "function"
  ) {
    return [];
  }

  try {
    const clipboardItems = await navigator.clipboard.read();
    const files: File[] = [];

    for (const clipboardItem of clipboardItems) {
      const imageType = clipboardItem.types.find((type) =>
        type.startsWith("image/")
      );
      if (!imageType) continue;

      const blob = await clipboardItem.getType(imageType);
      const extension = imageType.split("/")[1] || "png";
      files.push(
        new File([blob], `pasted-image.${extension}`, { type: imageType })
      );
    }

    return toUniqueImageFiles(files);
  } catch {
    return [];
  }
}

export function useCardEditorImageUpload() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);

  const handleImageFiles = useCallback(
    async (editor: Editor, files: File[]) => {
      const imageFiles = toUniqueImageFiles(files);
      if (imageFiles.length === 0 || isUploading) {
        return false;
      }

      const remainingSlots = Math.max(
        0,
        CARD_EDITOR_MAX_IMAGE_COUNT - countCardEditorImages(editor.getHTML())
      );
      if (remainingSlots === 0) {
        setErrorMessage(buildCardEditorMaxImageCountError());
        return true;
      }

      const selectedFiles = imageFiles.slice(0, remainingSlots);
      const errors: string[] = [];
      setUploading(true);
      setErrorMessage(null);

      try {
        for (const file of selectedFiles) {
          const validationError = validateCardEditorImageFile(file);
          if (validationError) {
            errors.push(`${file.name}: ${validationError}`);
            continue;
          }

          try {
            const uploaded = await uploadCardDeckImage(file);
            insertCardEditorImage(editor, uploaded.imageUrl);
          } catch (error) {
            errors.push(
              error instanceof Error
                ? `${file.name}: ${error.message}`
                : `${file.name}: 이미지 업로드에 실패했습니다.`
            );
          }
        }

        if (imageFiles.length > selectedFiles.length) {
          errors.push(buildCardEditorMaxImageCountError());
        }
      } finally {
        setUploading(false);
      }

      setErrorMessage(errors.length > 0 ? errors.join(" ") : null);
      return true;
    },
    [isUploading]
  );

  const handleClipboardPaste = useCallback(
    async (editor: Editor, clipboardData: DataTransfer) => {
      const directFiles = extractCardEditorImageFiles(clipboardData);
      if (directFiles.length > 0) {
        return handleImageFiles(editor, directFiles);
      }

      const clipboardApiFiles = await readClipboardImageFiles();
      if (clipboardApiFiles.length > 0) {
        return handleImageFiles(editor, clipboardApiFiles);
      }

      return false;
    },
    [handleImageFiles]
  );

  return {
    errorMessage,
    isUploading,
    setErrorMessage,
    handleImageFiles,
    handleClipboardPaste,
  };
}
