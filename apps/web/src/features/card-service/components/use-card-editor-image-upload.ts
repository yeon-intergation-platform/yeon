"use client";
import { type YeonTiptapEditor as Editor } from "@yeon/ui/rich-content/YeonTiptap";
import { useCallback, useState } from "react";
import {
  canReadYeonClipboardItems,
  fetchYeon,
  readYeonClipboardItems,
  type YeonDataTransfer,
  type YeonFile,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { uploadCardDeckImage } from "../card-service-fetch";
import {
  extractCardEditorClipboardImageSource,
  extractCardEditorImageFiles,
} from "./card-editor-clipboard-utils";
import {
  CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
  CARD_EDITOR_MAX_IMAGE_COUNT,
  buildCardEditorMaxImageCountError,
  countCardEditorImages,
  getCardEditorExtensionFromMime,
  getCardEditorImageNormalizationErrorMessage,
  normalizeCardEditorImageFileForUpload,
  toCardEditorFileFromBlob,
  validateCardEditorImageFile,
} from "./card-editor-image-utils";

interface ImageInsertRange {
  from: number;
  to: number;
}

interface ImageSourceFileReplacement {
  file: YeonFile;
  source: string;
}

function getCardEditorImageUploadErrorMessage(
  fileName: string,
  error: unknown
) {
  if (error instanceof Error && error.message.trim()) {
    return `${fileName}: ${error.message.trim()}`;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `${fileName}: 이미지 업로드에 실패했습니다. 원인: ${error.trim()}`;
  }

  return `${fileName}: 이미지 업로드에 실패했습니다. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

function getCardEditorPasteImageSourceErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return `이미지 URL을 가져올 수 없습니다. 원인: ${error.trim()}`;
  }

  return `이미지 URL을 가져올 수 없습니다. 원인: 처리할 수 없는 오류 형식(${String(error)})`;
}

function getCurrentImageInsertRange(editor: Editor): ImageInsertRange {
  return {
    from: editor.state.selection.from,
    to: editor.state.selection.to,
  };
}

function insertCardEditorImages(
  editor: Editor,
  imageUrls: string[],
  insertRange: ImageInsertRange
) {
  if (imageUrls.length === 0) {
    return;
  }

  const imageContents = imageUrls.map((src) => ({
    type: "image",
    attrs: {
      src,
      width: CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
    },
  }));
  const blockContents = [...imageContents, { type: "paragraph" }];

  try {
    editor.chain().focus().insertContentAt(insertRange, blockContents).run();
  } catch (error) {
    console.warn(
      "[CardEditorImageUpload] 선택 위치 이미지 삽입 실패 — 현재 커서 위치에 다시 삽입합니다.",
      error
    );
    editor.chain().focus().insertContent(blockContents).run();
  }
}

function replaceCardEditorImageSources(
  editor: Editor,
  replacements: Array<{ source: string; uploadedImageUrl: string }>
) {
  if (replacements.length === 0) {
    return;
  }

  const replacementBySource = new Map(
    replacements.map(({ source, uploadedImageUrl }) => [
      source,
      uploadedImageUrl,
    ])
  );
  const transaction = editor.state.tr;

  editor.state.doc.descendants((node, position) => {
    if (node.type.name !== "image") {
      return;
    }

    const source = typeof node.attrs.src === "string" ? node.attrs.src : "";
    const uploadedImageUrl = replacementBySource.get(source);
    if (!uploadedImageUrl) {
      return;
    }

    transaction.setNodeMarkup(position, undefined, {
      ...node.attrs,
      src: uploadedImageUrl,
    });
  });

  if (transaction.docChanged) {
    editor.view.dispatch(transaction);
  }
}

async function readClipboardImageFiles() {
  if (!canReadYeonClipboardItems()) {
    return [];
  }

  try {
    const clipboardItems = await readYeonClipboardItems();
    const files: YeonFile[] = [];

    for (const clipboardItem of clipboardItems) {
      const imageType = clipboardItem.types.find((type) =>
        type.startsWith("image/")
      );
      if (!imageType) continue;

      const blob = await clipboardItem.getType(imageType);
      const extension = getCardEditorExtensionFromMime(imageType) || "png";
      files.push(toCardEditorFileFromBlob(blob, `pasted-image.${extension}`));
    }

    return files;
  } catch (error) {
    console.warn("[CardEditorImageUpload] 클립보드 이미지 읽기 실패", error);
    return [];
  }
}

async function toDataImageFile(source: string, index = 0) {
  if (!source.startsWith("data:image/")) {
    return undefined;
  }

  const response = await fetchYeon(source);
  const blob = await response.blob();
  const extension = getCardEditorExtensionFromMime(blob.type) || "png";

  return toCardEditorFileFromBlob(
    blob,
    `pasted-image-${index + 1}.${extension}`
  );
}

export { extractCardEditorImageFiles };

export function useCardEditorImageUpload() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);

  const uploadNormalizedFile = useCallback(async (file: YeonFile) => {
    return uploadCardDeckImage(file);
  }, []);

  const handleImageFiles = useCallback(
    async (
      editor: Editor,
      files: YeonFile[],
      insertRange = getCurrentImageInsertRange(editor)
    ) => {
      if (files.length === 0 || isUploading) {
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

      const selectedFiles = files.slice(0, remainingSlots);
      const errors: string[] = [];
      const validFiles: YeonFile[] = [];

      for (const file of selectedFiles) {
        let normalizedFile: YeonFile;
        try {
          normalizedFile = await normalizeCardEditorImageFileForUpload(file);
        } catch (error) {
          errors.push(
            getCardEditorImageNormalizationErrorMessage(file.name, error)
          );
          continue;
        }

        const validationError = validateCardEditorImageFile(normalizedFile);
        if (validationError) {
          errors.push(`${normalizedFile.name}: ${validationError}`);
          continue;
        }

        validFiles.push(normalizedFile);
      }

      if (validFiles.length === 0) {
        setErrorMessage(errors.length > 0 ? errors.join(" ") : null);
        return true;
      }

      setUploading(true);
      setErrorMessage(null);

      try {
        const uploadedImageUrls: string[] = [];

        for (const file of validFiles) {
          try {
            const uploaded = await uploadNormalizedFile(file);
            uploadedImageUrls.push(uploaded.imageUrl);
          } catch (error) {
            errors.push(getCardEditorImageUploadErrorMessage(file.name, error));
          }
        }

        insertCardEditorImages(editor, uploadedImageUrls, insertRange);

        if (files.length > selectedFiles.length) {
          errors.push(buildCardEditorMaxImageCountError());
        }
      } finally {
        setUploading(false);
      }

      setErrorMessage(errors.length > 0 ? errors.join(" ") : null);
      return true;
    },
    [isUploading, uploadNormalizedFile]
  );

  const handleImageSourceFileReplacements = useCallback(
    async (editor: Editor, replacements: ImageSourceFileReplacement[]) => {
      if (replacements.length === 0 || isUploading) {
        return false;
      }

      const replacementSources = new Set(
        replacements.map(({ source }) => source)
      );
      const existingImageCount = Array.from(
        editor.getHTML().matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)
      ).filter((match) => !replacementSources.has(match[1] ?? "")).length;
      const remainingSlots = Math.max(
        0,
        CARD_EDITOR_MAX_IMAGE_COUNT - existingImageCount
      );

      if (remainingSlots === 0) {
        setErrorMessage(buildCardEditorMaxImageCountError());
        return true;
      }

      const selectedReplacements = replacements.slice(0, remainingSlots);
      const errors: string[] = [];
      const validReplacements: ImageSourceFileReplacement[] = [];

      for (const replacement of selectedReplacements) {
        let normalizedFile: YeonFile;
        try {
          normalizedFile = await normalizeCardEditorImageFileForUpload(
            replacement.file
          );
        } catch (error) {
          errors.push(
            getCardEditorImageNormalizationErrorMessage(
              replacement.file.name,
              error
            )
          );
          continue;
        }

        const validationError = validateCardEditorImageFile(normalizedFile);
        if (validationError) {
          errors.push(`${normalizedFile.name}: ${validationError}`);
          continue;
        }

        validReplacements.push({
          file: normalizedFile,
          source: replacement.source,
        });
      }

      if (validReplacements.length === 0) {
        setErrorMessage(errors.length > 0 ? errors.join(" ") : null);
        return true;
      }

      setUploading(true);
      setErrorMessage(null);

      try {
        const uploadedReplacements: Array<{
          source: string;
          uploadedImageUrl: string;
        }> = [];

        for (const replacement of validReplacements) {
          try {
            const uploaded = await uploadNormalizedFile(replacement.file);
            uploadedReplacements.push({
              source: replacement.source,
              uploadedImageUrl: uploaded.imageUrl,
            });
          } catch (error) {
            errors.push(
              getCardEditorImageUploadErrorMessage(replacement.file.name, error)
            );
          }
        }

        replaceCardEditorImageSources(editor, uploadedReplacements);

        if (replacements.length > selectedReplacements.length) {
          errors.push(buildCardEditorMaxImageCountError());
        }
      } finally {
        setUploading(false);
      }

      setErrorMessage(errors.length > 0 ? errors.join(" ") : null);
      return true;
    },
    [isUploading, uploadNormalizedFile]
  );

  const handlePasteImageSource = useCallback(
    async (editor: Editor, source: string) => {
      if (isUploading) {
        return false;
      }

      const existingImageCount = countCardEditorImages(editor.getHTML());
      if (existingImageCount >= CARD_EDITOR_MAX_IMAGE_COUNT) {
        setErrorMessage(buildCardEditorMaxImageCountError());
        return true;
      }

      setUploading(true);
      setErrorMessage(null);

      try {
        const dataImageFile = await toDataImageFile(source);
        let file = dataImageFile;

        if (!file) {
          const response = await fetchYeon(source);
          if (!response.ok) {
            throw new Error("이미지를 가져올 수 없습니다.");
          }

          const blob = await response.blob();
          const extension = getCardEditorExtensionFromMime(blob.type) || "png";
          file = toCardEditorFileFromBlob(blob, `pasted-image.${extension}`);
        }

        const normalizedFile =
          await normalizeCardEditorImageFileForUpload(file);
        const validationError = validateCardEditorImageFile(normalizedFile);
        if (validationError) {
          setErrorMessage(`${normalizedFile.name}: ${validationError}`);
          return true;
        }

        const uploaded = await uploadNormalizedFile(normalizedFile);
        insertCardEditorImages(
          editor,
          [uploaded.imageUrl],
          getCurrentImageInsertRange(editor)
        );
        return true;
      } catch (error) {
        setErrorMessage(getCardEditorPasteImageSourceErrorMessage(error));
        return true;
      } finally {
        setUploading(false);
      }
    },
    [isUploading, uploadNormalizedFile]
  );

  const handleClipboardPaste = useCallback(
    async (editor: Editor, clipboardData: YeonDataTransfer) => {
      const directFiles = extractCardEditorImageFiles(clipboardData);
      if (directFiles.length > 0) {
        return handleImageFiles(editor, directFiles);
      }

      const clipboardApiFiles = await readClipboardImageFiles();
      if (clipboardApiFiles.length > 0) {
        return handleImageFiles(editor, clipboardApiFiles);
      }

      const pastedImageSource =
        extractCardEditorClipboardImageSource(clipboardData);
      if (pastedImageSource) {
        return handlePasteImageSource(editor, pastedImageSource);
      }

      return false;
    },
    [handleImageFiles, handlePasteImageSource]
  );

  return {
    errorMessage,
    isUploading,
    setErrorMessage,
    handleImageFiles,
    handleClipboardPaste,
    handleImageSourceFileReplacements,
  };
}
