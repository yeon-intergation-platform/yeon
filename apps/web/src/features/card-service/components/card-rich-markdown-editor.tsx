"use client";

import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  CardEditorYouTubeEmbedExtension,
  ResizableCardEditorImageExtension,
} from "./card-editor-extensions";
import { CardEditorToolbar } from "./card-editor-toolbar";
import {
  CARD_EDITOR_HEIGHT_CLASS,
  CardEditorPreview,
  CardRichEditorGlobalStyles,
} from "./card-rich-markdown-editor-view";
import {
  extractCardEditorHtmlImageSources,
  extractCardEditorImageFiles,
  hasCardEditorClipboardImageHint,
  isCardEditorClipboardImageOnly,
} from "./card-editor-clipboard-utils";
import {
  CARD_EDITOR_IMAGE_ACCEPT,
  getCardEditorExtensionFromMime,
  toCardEditorFileFromBlob,
} from "./card-editor-image-utils";
import { normalizeCardEditorRichClipboardHtml } from "./card-editor-rich-clipboard-normalizer";
import {
  convertCardEditorHtmlTableToMarkdownTable,
  convertCardEditorTabularTextToMarkdownTable,
  isCardEditorHtmlTableOnlyPaste,
} from "./card-editor-table-utils";
import { isSingleCardEditorYouTubeUrlText } from "./card-editor-youtube-utils";
import { useCardEditorImageUpload } from "./use-card-editor-image-upload";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";

interface CardRichMarkdownEditorProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  helperText?: string;
  density?: "question" | "answer";
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

function positionEditorSelectionFromDropEvent(
  editor: Editor,
  event: DragEvent
) {
  const view = editor.view;
  const position = view.posAtCoords({
    left: event.clientX,
    top: event.clientY,
  });

  if (!position) {
    return;
  }

  editor.chain().setTextSelection(position.pos).focus().run();
}

function insertCardEditorMarkdownTable(editor: Editor, markdownTable: string) {
  const tableRows = markdownTable.split("\n").map((line) => ({
    type: "paragraph",
    content: [
      {
        type: "text",
        text: line,
      },
    ],
  }));

  return editor.chain().focus().insertContent(tableRows).run();
}

export function CardRichMarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  density = "question",
  disabled = false,
  onUploadingChange,
}: CardRichMarkdownEditorProps) {
  const [toolbarTick, setToolbarTick] = useState(0);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isInternalUpdateRef = useRef(false);
  const {
    errorMessage,
    isUploading,
    setErrorMessage,
    handleImageFiles,
    handleClipboardPaste,
    handleImageSourceFileReplacements,
  } = useCardEditorImageUpload();
  const heightClassName = CARD_EDITOR_HEIGHT_CLASS[density];

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const getNewImageSources = (
    beforeSources: string[],
    afterSources: string[]
  ) => {
    const remainingBeforeSourceCounts = new Map<string, number>();
    beforeSources.forEach((source) => {
      remainingBeforeSourceCounts.set(
        source,
        (remainingBeforeSourceCounts.get(source) ?? 0) + 1
      );
    });

    return afterSources.filter((source) => {
      const remainingCount = remainingBeforeSourceCounts.get(source) ?? 0;
      if (remainingCount > 0) {
        remainingBeforeSourceCounts.set(source, remainingCount - 1);
        return false;
      }

      return true;
    });
  };

  const toDataImageFile = async (source: string, index: number) => {
    if (!source.startsWith("data:image/")) {
      return undefined;
    }

    const response = await fetch(source);
    const blob = await response.blob();
    const extension = getCardEditorExtensionFromMime(blob.type) || "png";

    return toCardEditorFileFromBlob(
      blob,
      `pasted-image-${index + 1}.${extension}`
    );
  };

  const replaceMixedClipboardImagesAfterPaste = (
    editorInstance: Editor,
    clipboardData: DataTransfer,
    imageSourcesBeforePaste: string[]
  ) => {
    const imageFiles = extractCardEditorImageFiles(clipboardData);

    window.setTimeout(() => {
      const imageSourcesAfterPaste = extractCardEditorHtmlImageSources(
        editorInstance.getHTML()
      );
      const newImageSources = getNewImageSources(
        imageSourcesBeforePaste,
        imageSourcesAfterPaste
      );

      if (newImageSources.length === 0) {
        if (imageFiles.length > 0) {
          handleImageFiles(editorInstance, imageFiles).catch(() => {
            setErrorMessage("이미지 붙여넣기에 실패했습니다.");
          });
        }

        return;
      }

      Promise.all(
        newImageSources.map(async (source, index) => {
          const dataImageFile = await toDataImageFile(source, index);
          if (dataImageFile) {
            return { file: dataImageFile, source };
          }

          const imageFile = imageFiles[index];
          if (!imageFile) {
            return undefined;
          }

          return { file: imageFile, source };
        })
      )
        .then((replacements) => {
          const validReplacements = replacements.filter(
            (
              replacement
            ): replacement is {
              file: File;
              source: string;
            } => replacement !== undefined
          );

          if (validReplacements.length === 0) {
            return;
          }

          return handleImageSourceFileReplacements(
            editorInstance,
            validReplacements
          );
        })
        .catch(() => {
          setErrorMessage("이미지 붙여넣기에 실패했습니다.");
        });
    }, 0);
  };

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noreferrer",
          target: "_blank",
        },
      }),
      ResizableCardEditorImageExtension.configure({ inline: true }),
      CardEditorYouTubeEmbedExtension,
      Placeholder.configure({
        placeholder: placeholder ?? "내용을 입력하세요.",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor: updatedEditor }) => {
      isInternalUpdateRef.current = true;
      onChange(updatedEditor.getHTML());
    },
    onTransaction: () => setToolbarTick((prev) => prev + 1),
    editorProps: {
      attributes: {
        class: `card-rich-editor-content ${heightClassName.editor} rounded-b-2xl border-x border-b border-[#e5e5e5] bg-white px-4 py-5 text-[15px] leading-7 text-[#111] outline-none md:px-5 md:text-[16px]`,
        spellcheck: "true",
        "aria-label": label,
      },
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData || !editor) {
          return false;
        }

        const clipboardImageOnly =
          hasCardEditorClipboardImageHint(clipboardData) &&
          isCardEditorClipboardImageOnly(clipboardData);

        if (clipboardImageOnly) {
          event.preventDefault();
          handleClipboardPaste(editor, clipboardData).catch(() => {
            setErrorMessage("이미지 붙여넣기에 실패했습니다.");
          });
          return true;
        }

        const pastedHtml = clipboardData.getData("text/html");
        const pastedText = clipboardData.getData("text/plain");
        const markdownTable = isCardEditorHtmlTableOnlyPaste(pastedHtml)
          ? convertCardEditorHtmlTableToMarkdownTable(pastedHtml)
          : !pastedHtml.trim()
            ? convertCardEditorTabularTextToMarkdownTable(pastedText)
            : undefined;

        if (markdownTable) {
          event.preventDefault();
          insertCardEditorMarkdownTable(editor, markdownTable);
          return true;
        }

        const normalizedRichClipboardHtml =
          normalizeCardEditorRichClipboardHtml(pastedHtml);

        if (normalizedRichClipboardHtml.hasChanges) {
          event.preventDefault();
          const imageSourcesBeforePaste = extractCardEditorHtmlImageSources(
            editor.getHTML()
          );
          editor
            .chain()
            .focus()
            .insertContent(normalizedRichClipboardHtml.html)
            .run();
          replaceMixedClipboardImagesAfterPaste(
            editor,
            clipboardData,
            imageSourcesBeforePaste
          );

          if (normalizedRichClipboardHtml.notionAttachmentCount > 0) {
            setErrorMessage(
              "Notion 첨부 이미지는 원본 파일이 클립보드에 없어 안내 문구를 넣었습니다. 이미지는 직접 업로드해주세요."
            );
          }

          return true;
        }

        replaceMixedClipboardImagesAfterPaste(
          editor,
          clipboardData,
          extractCardEditorHtmlImageSources(editor.getHTML())
        );

        const youtubeEmbed = isSingleCardEditorYouTubeUrlText(pastedText);
        if (!youtubeEmbed) {
          return false;
        }

        event.preventDefault();
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: "youtubeEmbed",
              attrs: {
                src: youtubeEmbed.embedUrl,
                title: "YouTube video player",
              },
            },
            { type: "paragraph" },
          ])
          .run();
        return true;
      },
      handleDrop: (_view, event) => {
        const dataTransfer = event.dataTransfer;
        if (!dataTransfer || !editor) {
          return false;
        }

        const files = extractCardEditorImageFiles(dataTransfer);
        if (files.length === 0) {
          return false;
        }

        event.preventDefault();
        positionEditorSelectionFromDropEvent(editor, event);
        handleImageFiles(editor, files).catch(() => {
          setErrorMessage("이미지 드롭에 실패했습니다.");
        });
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  const uploadCurrentInputFiles = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    const files = selectedFiles ? Array.from(selectedFiles) : [];
    event.target.value = "";
    if (!editor || files.length === 0) return;
    await handleImageFiles(editor, files);
  };

  const withEditor = useCallback(
    (callback: (editor: Editor) => void) => () => {
      if (!editor || disabled) return;
      callback(editor);
      setToolbarTick((prev) => prev + 1);
    },
    [disabled, editor]
  );

  const canUseToolbar = Boolean(editor && !disabled);
  const toolbarState = useMemo(() => ({ tick: toolbarTick }), [toolbarTick]);
  void toolbarState;

  const toolbarActiveState = {
    bold: editor?.isActive("bold"),
    italic: editor?.isActive("italic"),
    underline: editor?.isActive("underline"),
    bulletList: editor?.isActive("bulletList"),
    orderedList: editor?.isActive("orderedList"),
    blockquote: editor?.isActive("blockquote"),
  };
  const handleInsertTable = withEditor((instance) => {
    insertCardEditorMarkdownTable(
      instance,
      ["| 항목 | 설명 |", "| --- | --- |", "| 예시 | 내용을 입력하세요 |"].join(
        "\n"
      )
    );
  });
  const editorPanel = (
    <div className="min-w-0 rounded-2xl bg-white">
      <CardEditorToolbar
        canUseToolbar={canUseToolbar}
        isUploading={isUploading}
        active={toolbarActiveState}
        canUndo={editor?.can().undo()}
        canRedo={editor?.can().redo()}
        onBold={withEditor((instance) =>
          instance.chain().focus().toggleBold().run()
        )}
        onItalic={withEditor((instance) =>
          instance.chain().focus().toggleItalic().run()
        )}
        onUnderline={withEditor((instance) =>
          instance.chain().focus().toggleUnderline().run()
        )}
        onBulletList={withEditor((instance) =>
          instance.chain().focus().toggleBulletList().run()
        )}
        onOrderedList={withEditor((instance) =>
          instance.chain().focus().toggleOrderedList().run()
        )}
        onBlockquote={withEditor((instance) =>
          instance.chain().focus().toggleBlockquote().run()
        )}
        onTable={handleInsertTable}
        onImage={() => fileInputRef.current?.click()}
        onUndo={withEditor((instance) => instance.chain().focus().undo().run())}
        onRedo={withEditor((instance) => instance.chain().focus().redo().run())}
      />

      <EditorContent editor={editor} className={heightClassName.editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept={CARD_EDITOR_IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => {
          void uploadCurrentInputFiles(event);
        }}
      />

      {isUploading ? (
        <p className="mt-2 text-[12px] font-medium text-[#777]">
          이미지 업로드 중입니다. 완료되면 커서 위치에 삽입됩니다.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-2 text-[12px] font-medium text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="rounded-2xl bg-white">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <label
            className={`${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis} md:text-[15px]`}
          >
            {label}
          </label>
          {helperText ? (
            <p className="mt-1 text-[12px] leading-5 text-[#777]">
              {helperText}
            </p>
          ) : null}
        </div>
        <span className="text-[12px] font-medium text-[#777]">
          {isUploading ? "업로드 중" : "드롭·붙여넣기·버튼 삽입"}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 rounded-2xl border border-[#e8e8e8] bg-[#fafafa] p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePane("edit")}
          className={`rounded-xl px-3 py-2 text-[13px] font-semibold ${
            mobilePane === "edit"
              ? "bg-white text-[#111] shadow-sm"
              : "text-[#777]"
          }`}
        >
          작성
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("preview")}
          className={`rounded-xl px-3 py-2 text-[13px] font-semibold ${
            mobilePane === "preview"
              ? "bg-white text-[#111] shadow-sm"
              : "text-[#777]"
          }`}
        >
          미리보기
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)] lg:items-stretch lg:gap-5">
        <div className={mobilePane === "edit" ? "block" : "hidden lg:block"}>
          {editorPanel}
        </div>
        <div className={mobilePane === "preview" ? "block" : "hidden lg:block"}>
          <CardEditorPreview
            label={label}
            value={value}
            previewHeightClassName={heightClassName.preview}
          />
        </div>
      </div>

      <CardRichEditorGlobalStyles />
    </div>
  );
}
