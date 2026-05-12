"use client";

import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import { type NodeViewRendererProps } from "@tiptap/core";
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

import { uploadCardDeckImage } from "../hooks/card-service-fetch";

const CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
] as const;
const CARD_EDITOR_IMAGE_ACCEPT = CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS.map(
  (extension) => `.${extension}`
).join(",");
const CARD_EDITOR_MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const CARD_EDITOR_MAX_IMAGE_COUNT = 20;
const CARD_EDITOR_IMAGE_MIN_WIDTH = 160;
const CARD_EDITOR_IMAGE_DEFAULT_WIDTH = 480;
const CARD_EDITOR_IMAGE_MAX_WIDTH = 900;

interface CardRichMarkdownEditorProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

function clampImageWidth(value: number) {
  return Math.min(
    CARD_EDITOR_IMAGE_MAX_WIDTH,
    Math.max(CARD_EDITOR_IMAGE_MIN_WIDTH, Math.round(value))
  );
}

function parseImageWidth(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return CARD_EDITOR_IMAGE_DEFAULT_WIDTH;
  }
  return clampImageWidth(parsed);
}

function countImages(html: string) {
  if (!html.trim()) return 0;
  const matches = html.match(/<img\b/gi);
  return matches?.length ?? 0;
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.trim().toLowerCase() ?? "";
}

function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    return "이미지 파일만 업로드할 수 있습니다.";
  }
  if (file.size > CARD_EDITOR_MAX_IMAGE_SIZE) {
    return "이미지는 10MB 이하만 업로드할 수 있습니다.";
  }
  const extension = getFileExtension(file.name);
  if (
    extension &&
    !CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS.includes(
      extension as (typeof CARD_EDITOR_ALLOWED_IMAGE_EXTENSIONS)[number]
    )
  ) {
    return "JPG, PNG, WEBP, GIF 이미지만 업로드할 수 있습니다.";
  }
  return null;
}

function insertImage(editor: Editor, imageUrl: string) {
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

function updateImageNodeWidth(props: NodeViewRendererProps, nextWidth: number) {
  const pos = props.getPos();
  if (typeof pos !== "number") return;
  const currentNode = props.view.state.doc.nodeAt(pos);
  if (!currentNode) return;
  props.view.dispatch(
    props.view.state.tr.setNodeMarkup(pos, undefined, {
      ...currentNode.attrs,
      width: clampImageWidth(nextWidth),
    })
  );
}

function createResizableImageNodeView(props: NodeViewRendererProps) {
  const wrapperElement = document.createElement("span");
  const imageElement = document.createElement("img");
  const resizeHandleElement = document.createElement("span");
  const sizeLabelElement = document.createElement("span");
  let currentWidth = parseImageWidth(props.node.attrs.width);
  let removePointerListeners: (() => void) | undefined;

  const applyAttributes = (attrs: Record<string, unknown>) => {
    const nextWidth = parseImageWidth(attrs.width);
    currentWidth = nextWidth;
    wrapperElement.style.width = `${nextWidth}px`;
    imageElement.src = typeof attrs.src === "string" ? attrs.src : "";
    imageElement.alt = typeof attrs.alt === "string" ? attrs.alt : "";
    imageElement.title = typeof attrs.title === "string" ? attrs.title : "";
    imageElement.width = nextWidth;
    imageElement.style.width = `${nextWidth}px`;
    imageElement.style.height = "auto";
    sizeLabelElement.textContent = `표시 크기: ${nextWidth}px`;
  };

  wrapperElement.className = "card-rich-editor-image";
  wrapperElement.contentEditable = "false";
  resizeHandleElement.className = "card-rich-editor-image-handle";
  resizeHandleElement.setAttribute("aria-hidden", "true");
  sizeLabelElement.className = "card-rich-editor-image-size";

  applyAttributes(props.node.attrs);
  wrapperElement.append(imageElement, resizeHandleElement, sizeLabelElement);

  resizeHandleElement.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = currentWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = clampImageWidth(
        startWidth + moveEvent.clientX - startX
      );
      currentWidth = nextWidth;
      wrapperElement.style.width = `${nextWidth}px`;
      imageElement.width = nextWidth;
      imageElement.style.width = `${nextWidth}px`;
      sizeLabelElement.textContent = `표시 크기: ${nextWidth}px`;
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      handlePointerMove(upEvent);
      updateImageNodeWidth(props, currentWidth);
      removePointerListeners?.();
      removePointerListeners = undefined;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp, { once: true });
    removePointerListeners = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  });

  return {
    dom: wrapperElement,
    update: (nextNode: typeof props.node) => {
      if (nextNode.type !== props.node.type) return false;
      applyAttributes(nextNode.attrs);
      return true;
    },
    selectNode: () => wrapperElement.classList.add("is-selected"),
    deselectNode: () => wrapperElement.classList.remove("is-selected"),
    stopEvent: (event: Event) => event.target === resizeHandleElement,
    destroy: () => removePointerListeners?.(),
  };
}

const ResizableImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
        parseHTML: (element: HTMLElement) =>
          parseImageWidth(element.getAttribute("width")),
        renderHTML: (attributes: Record<string, unknown>) => ({
          width: String(parseImageWidth(attributes.width)),
        }),
      },
    };
  },

  addNodeView() {
    return (props) => createResizableImageNodeView(props);
  },
});

function ToolbarButton({
  active,
  disabled,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white text-[#111] hover:bg-[#f7f7f7]"
      }`}
    >
      {children}
    </button>
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);
  const [toolbarTick, setToolbarTick] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isInternalUpdateRef = useRef(false);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const uploadAndInsertFiles = useCallback(
    async (editor: Editor, files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      const remainingSlots = Math.max(
        0,
        CARD_EDITOR_MAX_IMAGE_COUNT - countImages(editor.getHTML())
      );
      if (remainingSlots === 0) {
        setErrorMessage(
          `이미지는 카드 한 면당 최대 ${CARD_EDITOR_MAX_IMAGE_COUNT}개까지 넣을 수 있습니다.`
        );
        return;
      }

      const selectedFiles = imageFiles.slice(0, remainingSlots);
      const errors: string[] = [];
      setUploading(true);
      setErrorMessage(null);
      try {
        for (const file of selectedFiles) {
          const validationError = validateImageFile(file);
          if (validationError) {
            errors.push(`${file.name}: ${validationError}`);
            continue;
          }
          try {
            const uploaded = await uploadCardDeckImage(file);
            insertImage(editor, uploaded.imageUrl);
          } catch (error) {
            errors.push(
              error instanceof Error
                ? `${file.name}: ${error.message}`
                : `${file.name}: 이미지 업로드에 실패했습니다.`
            );
          }
        }
        if (imageFiles.length > selectedFiles.length) {
          errors.push(
            `이미지는 카드 한 면당 최대 ${CARD_EDITOR_MAX_IMAGE_COUNT}개까지 넣을 수 있습니다.`
          );
        }
      } finally {
        setUploading(false);
      }
      setErrorMessage(errors.length > 0 ? errors.join(" ") : null);
    },
    []
  );

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
      ResizableImageExtension,
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
          "card-rich-editor-content min-h-[180px] rounded-b-2xl border-x border-b border-[#e5e5e5] bg-white px-4 py-4 text-[15px] leading-7 text-[#111] outline-none md:text-[16px]",
        spellcheck: "true",
      },
      handlePaste: (_view, event) => {
        const clipboardFiles = event.clipboardData?.files;
        const files = clipboardFiles
          ? Array.from(clipboardFiles).filter((file) =>
              file.type.startsWith("image/")
            )
          : [];
        if (files.length === 0) return false;
        event.preventDefault();
        if (!editor) return false;
        uploadAndInsertFiles(editor, files).catch(() => {
          setErrorMessage("이미지 붙여넣기에 실패했습니다.");
        });
        return true;
      },
      handleDrop: (_view, event) => {
        const droppedFiles = event.dataTransfer?.files;
        const files = droppedFiles
          ? Array.from(droppedFiles).filter((file) =>
              file.type.startsWith("image/")
            )
          : [];
        if (files.length === 0) return false;
        event.preventDefault();
        if (!editor) return false;
        uploadAndInsertFiles(editor, files).catch(() => {
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
    await uploadAndInsertFiles(editor, files);
  };

  const withEditor = (callback: (editor: Editor) => void) => () => {
    if (!editor || disabled) return;
    callback(editor);
    setToolbarTick((prev) => prev + 1);
  };

  const canUseToolbar = Boolean(editor && !disabled);
  const toolbarState = useMemo(() => ({ tick: toolbarTick }), [toolbarTick]);
  void toolbarState;

  return (
    <div className="rounded-2xl bg-white">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
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
          {isUploading ? "업로드 중..." : "이미지 드롭·붙여넣기 가능"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 rounded-t-2xl border border-[#e5e5e5] bg-[#fafafa] p-2">
        <ToolbarButton
          disabled={!canUseToolbar}
          active={editor?.isActive("bold")}
          onClick={withEditor((instance) =>
            instance.chain().focus().toggleBold().run()
          )}
        >
          굵게
        </ToolbarButton>
        <ToolbarButton
          disabled={!canUseToolbar}
          active={editor?.isActive("italic")}
          onClick={withEditor((instance) =>
            instance.chain().focus().toggleItalic().run()
          )}
        >
          기울임
        </ToolbarButton>
        <ToolbarButton
          disabled={!canUseToolbar}
          active={editor?.isActive("underline")}
          onClick={withEditor((instance) =>
            instance.chain().focus().toggleUnderline().run()
          )}
        >
          밑줄
        </ToolbarButton>
        <ToolbarButton
          disabled={!canUseToolbar}
          active={editor?.isActive("bulletList")}
          onClick={withEditor((instance) =>
            instance.chain().focus().toggleBulletList().run()
          )}
        >
          목록
        </ToolbarButton>
        <ToolbarButton
          disabled={!canUseToolbar}
          active={editor?.isActive("orderedList")}
          onClick={withEditor((instance) =>
            instance.chain().focus().toggleOrderedList().run()
          )}
        >
          번호
        </ToolbarButton>
        <ToolbarButton
          disabled={!canUseToolbar}
          active={editor?.isActive("blockquote")}
          onClick={withEditor((instance) =>
            instance.chain().focus().toggleBlockquote().run()
          )}
        >
          인용
        </ToolbarButton>
        <ToolbarButton
          disabled={!canUseToolbar || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          이미지
        </ToolbarButton>
        <ToolbarButton
          disabled={!canUseToolbar}
          onClick={withEditor((instance) =>
            instance.chain().focus().undo().run()
          )}
        >
          되돌리기
        </ToolbarButton>
        <ToolbarButton
          disabled={!canUseToolbar}
          onClick={withEditor((instance) =>
            instance.chain().focus().redo().run()
          )}
        >
          다시실행
        </ToolbarButton>
      </div>

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

      {errorMessage ? (
        <p className="mt-2 text-[12px] font-medium text-red-600">
          {errorMessage}
        </p>
      ) : null}

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
          bottom: -7px;
          cursor: ew-resize;
          height: 16px;
          position: absolute;
          right: -7px;
          width: 16px;
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
