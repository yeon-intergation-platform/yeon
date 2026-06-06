"use client";
import {
  useYeonTiptapEditor as useEditor,
  YeonTiptapCellSelection as CellSelection,
  YeonTiptapEditorContent as EditorContent,
  YeonTiptapLinkExtension as LinkExtension,
  YeonTiptapNodeSelection as NodeSelection,
  YeonTiptapPlaceholderExtension as Placeholder,
  YeonTiptapStarterKit as StarterKit,
  YeonTiptapTableCellExtension as TableCellExtension,
  YeonTiptapTableExtension as TableExtension,
  YeonTiptapTableHeaderExtension as TableHeaderExtension,
  YeonTiptapTableRowExtension as TableRowExtension,
  YeonTiptapUnderlineExtension as UnderlineExtension,
  type YeonTiptapEditor as Editor,
} from "@yeon/ui/rich-content/YeonTiptap";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CardEditorCodeBlockExtension,
  CardEditorYouTubeEmbedExtension,
  ResizableCardEditorImageExtension,
} from "./card-editor-extensions";
import { CardEditorToolbar } from "./card-editor-toolbar";
import {
  CARD_EDITOR_COMPACT_CLASS,
  CARD_EDITOR_HEIGHT_CLASS,
  CardEditorPreview,
  CardRichEditorGlobalStyles,
  getCardEditorHeightClass,
} from "./card-rich-markdown-editor-view";
import {
  extractCardEditorHtmlImageSources,
  extractCardEditorImageFiles,
  hasCardEditorClipboardImageHint,
  isCardEditorClipboardImageOnly,
} from "./card-editor-clipboard-utils";
import {
  parseSingleCardEditorMarkdownCodeFence,
  updateCardEditorCodeBlockLanguageInRichContent,
} from "./card-editor-codeblock-utils";
import { getCardEditorLineLeadingIndentBeforeCursor } from "./card-editor-enter-indent-utils";
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
  isCardEditorMarkdownTableSeparatorRow,
  normalizeCardEditorMarkdownTableLines,
  splitCardEditorMarkdownTableRow,
} from "./card-editor-table-utils";
import { serializeCardEditorSliceToMarkdown } from "./card-editor-markdown-serializer";
import { isSingleCardEditorYouTubeUrlText } from "./card-editor-youtube-utils";
import { useCardEditorImageUpload } from "./use-card-editor-image-upload";
import {
  YeonButton,
  YeonField,
  YeonIcon,
  YeonContextMenu,
  YeonPositionedButton,
  YeonText,
  type YeonIconName,
  type YeonContextMenuPosition,
  YeonLabel,
  YeonView,
  type YeonChangeEvent,
  type YeonDocumentKeyboardEvent,
  type YeonMouseEvent,
  type YeonEventTarget,
  type YeonInputElement,
  type YeonTableElement,
  type YeonElement,
} from "@yeon/ui";
import {
  getYeonClosestElement,
  isYeonElement,
  isYeonElementTagName,
} from "@yeon/ui/rich-content/YeonRichDom";
import {
  cancelYeonAnimationFrame,
  fetchYeon,
  requestYeonAnimationFrame,
  scheduleYeonTimeout,
  type YeonDataTransfer,
  type YeonFile,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { CARD_SERVICE_COMMON_CLASS } from "../card-service-common.const";

interface CardRichMarkdownEditorProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  helperText?: string;
  density?: keyof typeof CARD_EDITOR_HEIGHT_CLASS;
  layoutMode?: "default" | "compact";
  previewPlacement?: "inline" | "mobile" | "none";
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

type CardEditorToolbarState = {
  active: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    blockquote?: boolean;
    codeBlock?: boolean;
  };
  canUndo?: boolean;
  canRedo?: boolean;
  isTableToolbarVisible: boolean;
};

interface CardEditorTableActionOverlayState {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface CardEditorTableContextMenuState {
  position: YeonContextMenuPosition;
}

function TableEditIconButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: YeonIconName;
  onClick: () => void;
}) {
  return (
    <YeonButton
      type="button"
      aria-label={label}
      title={label}
      variant="icon"
      size="icon"
      className={`flex ${CARD_EDITOR_COMPACT_CLASS.toolbarButton} items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-[#111]`}
      onClick={onClick}
    >
      <YeonIcon name={icon} className={CARD_EDITOR_COMPACT_CLASS.toolbarIcon} />
    </YeonButton>
  );
}

function isSelectionInEmptyListItem(editor: Editor) {
  const { selection } = editor.state;

  if (!selection.empty) {
    return false;
  }

  const { $from } = selection;
  const isAtEmptyTextBlockStart =
    $from.parentOffset === 0 && $from.parent.content.size === 0;

  if (!isAtEmptyTextBlockStart) {
    return false;
  }

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === "listItem") {
      return true;
    }
  }

  return false;
}

function exitEmptyListItemOnBackspace(editor: Editor | null) {
  if (!editor || !isSelectionInEmptyListItem(editor)) {
    return false;
  }

  return editor.chain().focus().liftListItem("listItem").run();
}

function carryParagraphIndentOnEnter(editor: Editor | null) {
  if (!editor || !editor.state.selection.empty) {
    return false;
  }

  if (
    !editor.isActive("paragraph") ||
    editor.isActive("listItem") ||
    editor.isActive("codeBlock") ||
    editor.isActive("table")
  ) {
    return false;
  }

  const { $from } = editor.state.selection;

  if ($from.parent.type.name !== "paragraph") {
    return false;
  }

  const textBeforeCursor = $from.parent.textBetween(
    0,
    $from.parentOffset,
    "\n",
    "\n"
  );
  const indent = getCardEditorLineLeadingIndentBeforeCursor(textBeforeCursor);

  if (!indent) {
    return false;
  }

  return editor.chain().focus().splitBlock().insertContent(indent).run();
}

function isTableDeleteKeyboardEvent(event: YeonDocumentKeyboardEvent) {
  return (
    (event.key === "Backspace" || event.key === "Delete") &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

function shouldDeleteSelectedTableWithKeyboard(editor: Editor | null) {
  if (!editor) {
    return false;
  }

  const { selection } = editor.state;

  if (selection instanceof NodeSelection) {
    return selection.node.type.name === "table";
  }

  if (selection instanceof CellSelection) {
    return selection.$anchorCell.pos !== selection.$headCell.pos;
  }

  return false;
}

function deleteSelectedTableFromKeyboard(editor: Editor | null) {
  if (!shouldDeleteSelectedTableWithKeyboard(editor)) {
    return false;
  }

  return editor?.chain().focus().deleteTable().run() ?? false;
}

function insertCardEditorTableFromMarkdown(
  editor: Editor,
  markdownTable: string
) {
  const normalizedLines = normalizeCardEditorMarkdownTableLines(
    markdownTable.split("\n")
  );
  const lines = normalizedLines ?? markdownTable.split("\n");
  const contentRows = lines
    .filter((line) => !isCardEditorMarkdownTableSeparatorRow(line))
    .map(splitCardEditorMarkdownTableRow)
    .filter((cells) => cells.length > 0);

  if (contentRows.length === 0) {
    return false;
  }

  const columnCount = Math.max(...contentRows.map((cells) => cells.length));
  const tableRows = contentRows.map((cells, rowIndex) => ({
    type: "tableRow",
    content: Array.from({ length: columnCount }, (_, cellIndex) => {
      const text = cells[cellIndex] ?? "";
      return {
        type: rowIndex === 0 ? "tableHeader" : "tableCell",
        content: [
          {
            type: "paragraph",
            content: text ? [{ type: "text", text }] : undefined,
          },
        ],
      };
    }),
  }));

  return editor
    .chain()
    .focus()
    .insertContent([
      {
        type: "table",
        content: tableRows,
      },
      { type: "paragraph" },
    ])
    .run();
}

function findClosestTableElement(target: YeonEventTarget | null) {
  const tableElement = getYeonClosestElement<YeonTableElement>(target, "table");

  return isYeonElementTagName(tableElement, "table") ? tableElement : null;
}

function findSelectedTableElement(editor: Editor) {
  const { from } = editor.state.selection;
  const domAtPos = editor.view.domAtPos(from);
  const node = isYeonElement(domAtPos.node)
    ? domAtPos.node
    : domAtPos.node.parentElement;

  return findClosestTableElement(node);
}

const EMPTY_TOOLBAR_STATE: CardEditorToolbarState = {
  active: {},
  canUndo: false,
  canRedo: false,
  isTableToolbarVisible: false,
};

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

function toggleCardEditorSelectedTextCodeBlock(editor: Editor) {
  const { selection, doc } = editor.state;

  if (selection.empty) {
    return editor.chain().focus().toggleCodeBlock().run();
  }

  const selectedText = doc.textBetween(
    selection.from,
    selection.to,
    "\n",
    "\n"
  );

  if (!selectedText.trim()) {
    return editor.chain().focus().toggleCodeBlock().run();
  }

  return editor
    .chain()
    .focus()
    .insertContentAt(
      { from: selection.from, to: selection.to },
      {
        type: "codeBlock",
        attrs: { language: null },
        content: [{ type: "text", text: selectedText }],
      }
    )
    .run();
}

export function CardRichMarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  density = "question",
  layoutMode = "default",
  previewPlacement = "inline",
  disabled = false,
  onUploadingChange,
}: CardRichMarkdownEditorProps) {
  const deferredPreviewValue = useDeferredValue(value);
  const [toolbarState, setToolbarState] =
    useState<CardEditorToolbarState>(EMPTY_TOOLBAR_STATE);
  const [tableActionOverlay, setTableActionOverlay] =
    useState<CardEditorTableActionOverlayState | null>(null);
  const [tableContextMenu, setTableContextMenu] =
    useState<CardEditorTableContextMenuState | null>(null);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const editorPanelRef = useRef<YeonElement | null>(null);
  const fileInputRef = useRef<YeonInputElement | null>(null);
  const isInternalUpdateRef = useRef(false);
  const onUploadingChangeRef = useRef(onUploadingChange);
  const toolbarRefreshFrameRef = useRef<number | null>(null);
  const {
    errorMessage,
    isUploading,
    setErrorMessage,
    handleImageFiles,
    handleClipboardPaste,
    handleImageSourceFileReplacements,
  } = useCardEditorImageUpload();
  const heightClassName = getCardEditorHeightClass(density, layoutMode);
  const isCompactLayout = layoutMode === "compact";
  const editorContentClassName = isCompactLayout
    ? `${CARD_EDITOR_COMPACT_CLASS.editorContent} ${heightClassName.editor}`
    : `card-rich-editor-content ${heightClassName.editor} rounded-b-2xl border-x border-b border-[#e5e5e5] bg-white px-4 py-5 text-[15px] leading-7 text-[#111] outline-none md:px-5 md:text-[16px]`;

  useEffect(() => {
    onUploadingChangeRef.current = onUploadingChange;
  }, [onUploadingChange]);

  useEffect(() => {
    onUploadingChangeRef.current?.(isUploading);
  }, [isUploading]);

  const updateTableActionOverlay = useCallback(
    (tableElement: YeonTableElement | null) => {
      const panelElement = editorPanelRef.current;
      if (!panelElement || !tableElement) {
        setTableActionOverlay(null);
        return;
      }

      const panelRect = panelElement.getBoundingClientRect();
      const tableRect = tableElement.getBoundingClientRect();
      setTableActionOverlay({
        top: tableRect.top - panelRect.top,
        left: tableRect.left - panelRect.left,
        width: tableRect.width,
        height: tableRect.height,
      });
    },
    []
  );

  const scheduleToolbarStateRefresh = useCallback(
    (targetEditor: Editor | null) => {
      if (!targetEditor) return;
      if (toolbarRefreshFrameRef.current !== null) return;

      toolbarRefreshFrameRef.current = requestYeonAnimationFrame(() => {
        toolbarRefreshFrameRef.current = null;

        setToolbarState({
          active: {
            bold: targetEditor.isActive("bold"),
            italic: targetEditor.isActive("italic"),
            underline: targetEditor.isActive("underline"),
            bulletList: targetEditor.isActive("bulletList"),
            orderedList: targetEditor.isActive("orderedList"),
            blockquote: targetEditor.isActive("blockquote"),
            codeBlock: targetEditor.isActive("codeBlock"),
          },
          canUndo: targetEditor.can().undo(),
          canRedo: targetEditor.can().redo(),
          isTableToolbarVisible: targetEditor.isActive("table"),
        });
        updateTableActionOverlay(
          targetEditor.isActive("table")
            ? findSelectedTableElement(targetEditor)
            : null
        );
      });
    },
    [updateTableActionOverlay]
  );

  useEffect(() => {
    return () => {
      if (toolbarRefreshFrameRef.current === null) return;
      cancelYeonAnimationFrame(toolbarRefreshFrameRef.current);
      toolbarRefreshFrameRef.current = null;
    };
  }, []);

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

    const response = await fetchYeon(source);
    const blob = await response.blob();
    const extension = getCardEditorExtensionFromMime(blob.type) || "png";

    return toCardEditorFileFromBlob(
      blob,
      `pasted-image-${index + 1}.${extension}`
    );
  };

  const replaceMixedClipboardImagesAfterPaste = (
    editorInstance: Editor,
    clipboardData: YeonDataTransfer,
    imageSourcesBeforePaste: string[]
  ) => {
    const imageFiles = extractCardEditorImageFiles(clipboardData);

    scheduleYeonTimeout(() => {
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
              file: YeonFile;
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
        codeBlock: false,
        heading: { levels: [2, 3] },
      }),
      CardEditorCodeBlockExtension,
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noreferrer",
          target: "_blank",
        },
      }),
      TableExtension.configure({
        resizable: true,
        HTMLAttributes: {
          class: "card-rich-editor-table",
        },
      }),
      TableRowExtension,
      TableHeaderExtension,
      TableCellExtension,
      ResizableCardEditorImageExtension,
      CardEditorYouTubeEmbedExtension,
      Placeholder.configure({
        placeholder: placeholder ?? "내용을 입력하세요.",
      }),
    ],
    content: value || "",
    onCreate: ({ editor: createdEditor }) => {
      scheduleToolbarStateRefresh(createdEditor);
    },
    onUpdate: ({ editor: updatedEditor }) => {
      isInternalUpdateRef.current = true;
      onChange(updatedEditor.getHTML());
      scheduleToolbarStateRefresh(updatedEditor);
    },
    onSelectionUpdate: ({ editor: updatedEditor }) => {
      scheduleToolbarStateRefresh(updatedEditor);
    },
    editorProps: {
      attributes: {
        class: editorContentClassName,
        spellcheck: "true",
        "aria-label": label,
      },
      handleKeyDown: (_view, event) => {
        if (isTableDeleteKeyboardEvent(event)) {
          const didDeleteSelectedTable =
            deleteSelectedTableFromKeyboard(editor);

          if (didDeleteSelectedTable) {
            event.preventDefault();
            setTableActionOverlay(null);
            closeTableContextMenu();
            scheduleToolbarStateRefresh(editor);
            return true;
          }

          if (event.key === "Backspace") {
            const didExitEmptyListItem = exitEmptyListItemOnBackspace(editor);

            if (didExitEmptyListItem) {
              event.preventDefault();
              scheduleToolbarStateRefresh(editor);
              return true;
            }
          }
        }

        if (
          event.key === "Enter" &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey
        ) {
          const didCarryParagraphIndent = carryParagraphIndentOnEnter(editor);

          if (didCarryParagraphIndent) {
            event.preventDefault();
            scheduleToolbarStateRefresh(editor);
            return true;
          }
        }

        if (event.key !== "Tab" || event.shiftKey) {
          if (event.key === "Tab" && event.shiftKey) {
            const didLiftListItem = editor?.isActive("listItem")
              ? editor.chain().focus().liftListItem("listItem").run()
              : false;

            if (didLiftListItem) {
              event.preventDefault();
              scheduleToolbarStateRefresh(editor);
              return true;
            }
          }

          return false;
        }

        const inCodeBlock = editor?.isActive("codeBlock") ?? false;
        if (inCodeBlock) {
          return false;
        }

        const didSinkListItem = editor?.isActive("listItem")
          ? editor.chain().focus().sinkListItem("listItem").run()
          : false;

        if (didSinkListItem) {
          event.preventDefault();
          scheduleToolbarStateRefresh(editor);
          return true;
        }

        return false;
      },
      clipboardTextSerializer: (slice) =>
        serializeCardEditorSliceToMarkdown(slice),
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData || !editor) {
          return false;
        }

        if (editor.isActive("codeBlock")) {
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
        const pastedCodeBlock = !pastedHtml.trim()
          ? parseSingleCardEditorMarkdownCodeFence(pastedText)
          : undefined;

        if (pastedCodeBlock) {
          event.preventDefault();
          editor
            .chain()
            .focus()
            .insertContent([
              {
                type: "codeBlock",
                attrs: {
                  language: pastedCodeBlock.language ?? null,
                },
                content: pastedCodeBlock.code
                  ? [
                      {
                        type: "text",
                        text: pastedCodeBlock.code,
                      },
                    ]
                  : undefined,
              },
              { type: "paragraph" },
            ])
            .run();
          return true;
        }

        const markdownTable = isCardEditorHtmlTableOnlyPaste(pastedHtml)
          ? convertCardEditorHtmlTableToMarkdownTable(pastedHtml)
          : !pastedHtml.trim()
            ? convertCardEditorTabularTextToMarkdownTable(pastedText)
            : undefined;

        if (markdownTable) {
          event.preventDefault();
          insertCardEditorTableFromMarkdown(editor, markdownTable);
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
    event: YeonChangeEvent<YeonInputElement>
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
      scheduleToolbarStateRefresh(editor);
    },
    [disabled, editor, scheduleToolbarStateRefresh]
  );

  const handlePreviewCodeLanguageChange = useCallback(
    (index: number, language: string) => {
      if (disabled) return;
      onChange(
        updateCardEditorCodeBlockLanguageInRichContent(value, index, language)
      );
    },
    [disabled, onChange, value]
  );

  const canUseToolbar = Boolean(editor && !disabled);
  const toolbarActiveState = toolbarState.active;
  const isTableToolbarVisible =
    canUseToolbar && toolbarState.isTableToolbarVisible;
  const handleInsertTable = withEditor((instance) => {
    insertCardEditorTableFromMarkdown(
      instance,
      ["| 항목 | 설명 |", "| --- | --- |", "| 예시 | 내용을 입력하세요 |"].join(
        "\n"
      )
    );
  });
  const tableEditBar = isTableToolbarVisible ? (
    <YeonView className="flex flex-wrap items-center gap-2 border-x border-[#e5e5e5] bg-white px-3 py-2 text-[12px] font-medium text-[#666] md:px-4">
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="mr-1 text-[#111]"
      >
        표 편집
      </YeonText>
      <TableEditIconButton
        label="행 추가"
        icon="rows"
        onClick={withEditor((instance) =>
          instance.chain().focus().addRowAfter().run()
        )}
      />
      <TableEditIconButton
        label="열 추가"
        icon="columns"
        onClick={withEditor((instance) =>
          instance.chain().focus().addColumnAfter().run()
        )}
      />
      <TableEditIconButton
        label="헤더 행 전환"
        icon="align-horizontal-center"
        onClick={withEditor((instance) =>
          instance.chain().focus().toggleHeaderRow().run()
        )}
      />
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className="text-[#aaa]"
      >
        표 위의 + 버튼으로도 행과 열을 추가할 수 있어요.
      </YeonText>
    </YeonView>
  ) : null;
  const shouldShowPreview = previewPlacement !== "none";
  const shouldShowDesktopInlinePreview = previewPlacement === "inline";
  const compactEditorPanelRowsClassName = isTableToolbarVisible
    ? "grid-rows-[auto_auto_minmax(0,1fr)]"
    : "grid-rows-[auto_minmax(0,1fr)]";
  const editorPanelClassName = isCompactLayout
    ? `${CARD_EDITOR_COMPACT_CLASS.fieldShell} ${compactEditorPanelRowsClassName} relative`
    : "relative min-w-0 rounded-2xl bg-white";
  const mobilePaneClassName = isCompactLayout
    ? CARD_EDITOR_COMPACT_CLASS.mobileToggle
    : "mb-3 grid grid-cols-2 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-1 lg:hidden";
  const mobilePaneButtonClassName = isCompactLayout
    ? CARD_EDITOR_COMPACT_CLASS.mobileToggleButton
    : "rounded-xl px-3 py-2 text-[13px] font-semibold";
  const editorStatusText = isUploading
    ? "업로드 중"
    : "드롭·붙여넣기·버튼 삽입";
  const handleEditorMouseMove = useCallback(
    (event: YeonMouseEvent<YeonElement>) => {
      updateTableActionOverlay(findClosestTableElement(event.target));
    },
    [updateTableActionOverlay]
  );
  const handleEditorMouseLeave = useCallback(() => {
    if (editor?.isActive("table")) {
      updateTableActionOverlay(findSelectedTableElement(editor));
      return;
    }
    setTableActionOverlay(null);
  }, [editor, updateTableActionOverlay]);
  const closeTableContextMenu = useCallback(() => {
    setTableContextMenu(null);
  }, []);
  const handleEditorContextMenu = useCallback(
    (event: YeonMouseEvent<YeonElement>) => {
      if (!editor || disabled) {
        return;
      }

      const tableElement = findClosestTableElement(event.target);
      if (!tableElement) {
        closeTableContextMenu();
        return;
      }

      const position = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      if (!position) {
        return;
      }

      event.preventDefault();
      editor.chain().setTextSelection(position.pos).focus().run();
      updateTableActionOverlay(tableElement);
      setTableContextMenu({
        position: {
          x: event.clientX,
          y: event.clientY,
        },
      });
    },
    [closeTableContextMenu, disabled, editor, updateTableActionOverlay]
  );
  const deleteSelectedTable = useCallback(() => {
    if (!editor || disabled) {
      return;
    }

    editor.chain().focus().deleteTable().run();
    setTableActionOverlay(null);
    scheduleToolbarStateRefresh(editor);
  }, [disabled, editor, scheduleToolbarStateRefresh]);
  const editorBodyClassName = isCompactLayout
    ? CARD_EDITOR_COMPACT_CLASS.editorBody
    : undefined;
  const tableActionOverlayElement = tableActionOverlay ? (
    <YeonView className="pointer-events-none absolute inset-0 z-10">
      <YeonPositionedButton
        type="button"
        aria-label="뒤에 열 추가하기"
        title="뒤에 열 추가하기"
        variant="primary"
        size="icon"
        className="pointer-events-auto absolute h-6 w-6 rounded-md border border-[#e5e5e5] shadow-md"
        left={tableActionOverlay.left + tableActionOverlay.width + 6}
        top={tableActionOverlay.top + tableActionOverlay.height / 2 - 12}
        onClick={withEditor((instance) =>
          instance.chain().focus().addColumnAfter().run()
        )}
      >
        <YeonIcon name="plus" className="h-3.5 w-3.5" />
      </YeonPositionedButton>
      <YeonPositionedButton
        type="button"
        aria-label="아래에 행 추가하기"
        title="아래에 행 추가하기"
        variant="primary"
        size="icon"
        className="pointer-events-auto absolute h-6 w-6 rounded-md border border-[#e5e5e5] shadow-md"
        left={tableActionOverlay.left + tableActionOverlay.width / 2 - 12}
        top={tableActionOverlay.top + tableActionOverlay.height + 6}
        onClick={withEditor((instance) =>
          instance.chain().focus().addRowAfter().run()
        )}
      >
        <YeonIcon name="plus" className="h-3.5 w-3.5" />
      </YeonPositionedButton>
    </YeonView>
  ) : null;
  const editorPanel = (
    <YeonView ref={editorPanelRef} className={editorPanelClassName}>
      <CardEditorToolbar
        canUseToolbar={canUseToolbar}
        isUploading={isUploading}
        active={toolbarActiveState}
        canUndo={toolbarState.canUndo}
        canRedo={toolbarState.canRedo}
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
        onCodeBlock={withEditor(toggleCardEditorSelectedTextCodeBlock)}
        onTable={handleInsertTable}
        onImage={() => fileInputRef.current?.click()}
        onUndo={withEditor((instance) => instance.chain().focus().undo().run())}
        onRedo={withEditor((instance) => instance.chain().focus().redo().run())}
        density={isCompactLayout ? "compact" : "default"}
        leadingLabel={isCompactLayout ? label : undefined}
      />

      {tableEditBar}

      <YeonView
        className={editorBodyClassName}
        onContextMenu={handleEditorContextMenu}
        onMouseLeave={handleEditorMouseLeave}
        onMouseMove={handleEditorMouseMove}
      >
        <EditorContent editor={editor} />
      </YeonView>
      {tableActionOverlayElement}

      {tableContextMenu ? (
        <YeonContextMenu
          ariaLabel="표 컨텍스트 메뉴"
          position={tableContextMenu.position}
          onClose={closeTableContextMenu}
          items={[
            {
              key: "delete-table",
              label: "표 삭제",
              destructive: true,
              icon: <YeonIcon name="trash" className="h-4 w-4" />,
              onSelect: deleteSelectedTable,
            },
          ]}
        />
      ) : null}

      <YeonField
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
        <YeonText as="p" variant="caption" tone="secondary" className="mt-2">
          이미지 업로드 중입니다. 완료되면 커서 위치에 삽입됩니다.
        </YeonText>
      ) : null}

      {errorMessage ? (
        <YeonText
          as="p"
          variant="caption"
          tone="primary"
          className="mt-2 font-semibold"
        >
          {errorMessage}
        </YeonText>
      ) : null}
    </YeonView>
  );

  return (
    <YeonView
      className={
        isCompactLayout
          ? "flex h-full min-h-full flex-col bg-white"
          : "rounded-2xl bg-white"
      }
    >
      {!isCompactLayout ? (
        <YeonView className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <YeonView className="min-w-0">
            <YeonLabel
              className={`${CARD_SERVICE_COMMON_CLASS.panelTextEmphasis} md:text-[15px]`}
            >
              {label}
            </YeonLabel>
            {helperText ? (
              <YeonText
                as="p"
                variant="caption"
                tone="secondary"
                className="mt-1"
              >
                {helperText}
              </YeonText>
            ) : null}
          </YeonView>
          <YeonText as="span" variant="caption" tone="secondary">
            {editorStatusText}
          </YeonText>
        </YeonView>
      ) : null}

      {shouldShowPreview ? (
        <YeonView className={mobilePaneClassName}>
          <YeonButton
            type="button"
            onClick={() => setMobilePane("edit")}
            variant={mobilePane === "edit" ? "secondary" : "ghost"}
            size="sm"
            className={`${mobilePaneButtonClassName} ${
              mobilePane === "edit" ? "bg-white text-[#111] shadow-sm" : ""
            }`}
          >
            작성
          </YeonButton>
          <YeonButton
            type="button"
            onClick={() => setMobilePane("preview")}
            variant={mobilePane === "preview" ? "secondary" : "ghost"}
            size="sm"
            className={`${mobilePaneButtonClassName} ${
              mobilePane === "preview" ? "bg-white text-[#111] shadow-sm" : ""
            }`}
          >
            미리보기
          </YeonButton>
        </YeonView>
      ) : null}

      <YeonView
        className={
          shouldShowDesktopInlinePreview
            ? "lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)] lg:items-stretch lg:gap-5"
            : ""
        }
      >
        <YeonView
          className={
            shouldShowPreview
              ? mobilePane === "edit"
                ? "block"
                : "hidden lg:block"
              : "block"
          }
        >
          {editorPanel}
        </YeonView>
        {shouldShowPreview ? (
          <YeonView
            className={
              mobilePane === "preview"
                ? shouldShowDesktopInlinePreview
                  ? "block"
                  : "block lg:hidden"
                : shouldShowDesktopInlinePreview
                  ? "hidden lg:block"
                  : "hidden"
            }
          >
            <CardEditorPreview
              label={label}
              value={deferredPreviewValue}
              previewHeightClassName={heightClassName.preview}
              onCodeLanguageChange={handlePreviewCodeLanguageChange}
            />
          </YeonView>
        ) : null}
      </YeonView>

      <CardRichEditorGlobalStyles />
    </YeonView>
  );
}
