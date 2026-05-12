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

import { MarkdownContent } from "./markdown-content";
import { ResizableCardEditorImageExtension } from "./card-editor-extensions";
import { CARD_EDITOR_IMAGE_ACCEPT } from "./card-editor-image-utils";
import { CardEditorToolbar } from "./card-editor-toolbar";
import {
  extractCardEditorImageFiles,
  useCardEditorImageUpload,
} from "./use-card-editor-image-upload";

interface CardRichMarkdownEditorProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  helperText?: string;
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

function isMeaningfulCardEditorContent(value: string) {
  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0 || /<img\b/i.test(value)
  );
}

function CardEditorPreview({ label, value }: { label: string; value: string }) {
  const hasContent = isMeaningfulCardEditorContent(value);

  return (
    <aside className="rounded-2xl border border-[#e8e8e8] bg-[#fafafa] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-[#111]">미리보기</p>
        <p className="truncate text-[12px] font-medium text-[#888]">{label}</p>
      </div>
      <div className="min-h-[180px] rounded-2xl border border-[#eeeeee] bg-white p-4">
        {hasContent ? (
          <MarkdownContent>{value}</MarkdownContent>
        ) : (
          <p className="text-[13px] leading-6 text-[#999]">
            작성한 내용이 오른쪽에 실제 카드처럼 표시됩니다.
          </p>
        )}
      </div>
    </aside>
  );
}

export function CardRichMarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  helperText,
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
  } = useCardEditorImageUpload();

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

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
        class:
          "card-rich-editor-content min-h-[220px] rounded-b-2xl border-x border-b border-[#e5e5e5] bg-white px-4 py-4 text-[15px] leading-7 text-[#111] outline-none md:text-[16px]",
        spellcheck: "true",
        "aria-label": label,
      },
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData || !editor) {
          return false;
        }

        const imageFiles = extractCardEditorImageFiles(clipboardData);
        const hasClipboardImage =
          imageFiles.length > 0 ||
          Array.from(clipboardData.items).some((item) =>
            item.type.startsWith("image/")
          );

        if (!hasClipboardImage) {
          return false;
        }

        event.preventDefault();
        handleClipboardPaste(editor, clipboardData).catch(() => {
          setErrorMessage("이미지 붙여넣기에 실패했습니다.");
        });
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
        onImage={() => fileInputRef.current?.click()}
        onUndo={withEditor((instance) => instance.chain().focus().undo().run())}
        onRedo={withEditor((instance) => instance.chain().focus().redo().run())}
      />

      <EditorContent editor={editor} />

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
          <label className="text-[14px] font-semibold text-[#111] md:text-[15px]">
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

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] lg:gap-4">
        <div className={mobilePane === "edit" ? "block" : "hidden lg:block"}>
          {editorPanel}
        </div>
        <div className={mobilePane === "preview" ? "block" : "hidden lg:block"}>
          <CardEditorPreview label={label} value={value} />
        </div>
      </div>

      <style jsx global>{`
        .card-rich-editor-content .ProseMirror {
          min-height: inherit;
          outline: none;
        }
        .card-rich-editor-content
          .ProseMirror
          p.is-editor-empty:first-child::before {
          color: #aaa;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .card-rich-editor-content p {
          margin: 0.5rem 0;
        }
        .card-rich-editor-content ul,
        .card-rich-editor-content ol {
          margin: 0.5rem 0;
          padding-left: 1.35rem;
        }
        .card-rich-editor-content ul {
          list-style: disc;
        }
        .card-rich-editor-content ol {
          list-style: decimal;
        }
        .card-rich-editor-content blockquote {
          border-left: 4px solid #e5e5e5;
          color: #555;
          margin: 0.75rem 0;
          padding-left: 0.75rem;
        }
        .card-rich-editor-content a {
          text-decoration: underline;
        }
        .card-rich-editor-image {
          display: inline-block;
          max-width: 100%;
          position: relative;
          vertical-align: middle;
        }
        .card-rich-editor-image img {
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          display: block;
          height: auto;
          max-width: 100%;
        }
        .card-rich-editor-image.is-selected img {
          outline: 2px solid #111;
          outline-offset: 2px;
        }
        .card-rich-editor-image-handle {
          background: #111;
          border: 2px solid #fff;
          border-radius: 999px;
          bottom: -10px;
          box-shadow: 0 2px 8px rgba(17, 17, 17, 0.22);
          cursor: ew-resize;
          height: 22px;
          position: absolute;
          right: -10px;
          touch-action: none;
          width: 22px;
        }
        .card-rich-editor-image-size {
          background: rgba(17, 17, 17, 0.78);
          border-radius: 999px;
          bottom: 8px;
          color: white;
          font-size: 11px;
          left: 8px;
          padding: 3px 8px;
          position: absolute;
        }
      `}</style>
    </div>
  );
}
