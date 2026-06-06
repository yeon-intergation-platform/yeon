import type {
  YeonDocumentPointerEvent,
  YeonElement,
  YeonEventTarget,
  YeonSelectElement,
} from "@yeon/ui/types";
import {
  mergeAttributes,
  YeonTiptapCodeBlockExtension as CodeBlockExtension,
  YeonTiptapImageExtension as ImageExtension,
  YeonTiptapNode as Node,
  type YeonTiptapNodeViewRendererProps as NodeViewRendererProps,
  type YeonTiptapProseMirrorNode as ProseMirrorNode,
} from "@yeon/ui/rich-content/YeonTiptap";
import { addYeonDocumentEventListener } from "@yeon/ui/hooks/YeonBrowserHooks";
import {
  addYeonElementClass,
  createYeonDomElement,
  getYeonElementAttribute,
  getYeonOwnerDocument,
  isYeonElement,
  removeYeonElementClass,
  setYeonElementAttribute,
  setYeonElementStyleProperty,
  removeYeonElementStyleProperty,
  setYeonNodeTextContent,
} from "@yeon/ui/rich-content/YeonRichDom";
import {
  CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
  clampCardEditorImageHeight,
  clampCardEditorImageWidth,
  parseCardEditorImageWidth,
  parseOptionalCardEditorImageHeight,
} from "./card-editor-image-utils";
import {
  buildCardEditorYouTubeEmbedAttrs,
  extractCardEditorYouTubeEmbedInfo,
} from "./card-editor-youtube-utils";
import {
  CARD_EDITOR_CODE_LANGUAGE_GROUPS,
  getCardEditorCodeLanguageSelectValue,
  normalizeCardEditorCodeLanguage,
} from "./card-editor-codeblock-utils";

function updateCodeBlockNodeLanguage(
  props: NodeViewRendererProps,
  nextLanguageValue: string
) {
  const pos = props.getPos();
  if (typeof pos !== "number") return;

  const currentNode = props.view.state.doc.nodeAt(pos);
  if (!currentNode) return;

  props.view.dispatch(
    props.view.state.tr.setNodeMarkup(pos, undefined, {
      ...currentNode.attrs,
      language: normalizeCardEditorCodeLanguage(nextLanguageValue) ?? null,
    })
  );
}

function appendCodeLanguageOptions(select: YeonSelectElement) {
  const htmlDocument = getYeonOwnerDocument(select);

  CARD_EDITOR_CODE_LANGUAGE_GROUPS.forEach((group) => {
    const optionGroup = createYeonDomElement(htmlDocument, "optgroup");
    optionGroup.label = group.label;

    group.options.forEach(([value, label]) => {
      const option = createYeonDomElement(htmlDocument, "option");
      option.value = value;
      option.textContent = label;
      optionGroup.appendChild(option);
    });

    select.appendChild(optionGroup);
  });
}

function createCardEditorCodeBlockNodeView(props: NodeViewRendererProps) {
  const htmlDocument = getYeonOwnerDocument(props.view.dom);
  const wrapperElement = createYeonDomElement(htmlDocument, "div");
  const headerElement = createYeonDomElement(htmlDocument, "div");
  const labelElement = createYeonDomElement(htmlDocument, "label");
  const selectElement = createYeonDomElement(
    htmlDocument,
    "select"
  ) as YeonSelectElement;
  const preElement = createYeonDomElement(htmlDocument, "pre");
  const codeElement = createYeonDomElement(htmlDocument, "code");
  const codeContentClassName = "card-rich-editor-code-block-content";

  const renderLanguage = (languageValue: unknown) => {
    const language = normalizeCardEditorCodeLanguage(languageValue);
    selectElement.value = getCardEditorCodeLanguageSelectValue(language);
    if (language) {
      setYeonElementAttribute(
        codeElement,
        "class",
        `${codeContentClassName} language-${language}`
      );
      wrapperElement.dataset.language = language;
      return;
    }

    setYeonElementAttribute(codeElement, "class", codeContentClassName);
    delete wrapperElement.dataset.language;
  };

  wrapperElement.className = "card-rich-editor-code-block-node";
  headerElement.className = "card-rich-editor-code-block-header";
  headerElement.contentEditable = "false";
  labelElement.className = "card-rich-editor-code-block-label";
  setYeonNodeTextContent(labelElement, "코드 언어");
  selectElement.className = "card-rich-editor-code-block-language";
  selectElement.setAttribute("aria-label", "코드 언어 선택");
  appendCodeLanguageOptions(selectElement);
  selectElement.addEventListener("change", () => {
    updateCodeBlockNodeLanguage(props, selectElement.value);
    props.view.focus();
  });

  preElement.spellcheck = false;
  codeElement.className = codeContentClassName;

  headerElement.appendChild(labelElement);
  headerElement.appendChild(selectElement);
  preElement.appendChild(codeElement);
  wrapperElement.appendChild(headerElement);
  wrapperElement.appendChild(preElement);
  renderLanguage(props.node.attrs.language);

  return {
    dom: wrapperElement,
    contentDOM: codeElement,
    update: (node: ProseMirrorNode) => {
      if (node.type !== props.node.type) return false;
      renderLanguage(node.attrs.language);
      return true;
    },
  };
}

export const CardEditorCodeBlockExtension = CodeBlockExtension.extend({
  addNodeView() {
    return (props) => createCardEditorCodeBlockNodeView(props);
  },
}).configure({
  enableTabIndentation: true,
  tabSize: 4,
});

function updateImageNodeSize(
  props: NodeViewRendererProps,
  nextWidth: number,
  nextHeight: number | null
) {
  const pos = props.getPos();
  if (typeof pos !== "number") return;

  const currentNode = props.view.state.doc.nodeAt(pos);
  if (!currentNode) return;

  props.view.dispatch(
    props.view.state.tr.setNodeMarkup(pos, undefined, {
      ...currentNode.attrs,
      width: clampCardEditorImageWidth(nextWidth),
      height:
        nextHeight === null ? null : clampCardEditorImageHeight(nextHeight),
    })
  );
}

function createResizableImageNodeView(props: NodeViewRendererProps) {
  const htmlDocument = getYeonOwnerDocument(props.view.dom);
  const wrapperElement = createYeonDomElement(htmlDocument, "span");
  const imageElement = createYeonDomElement(htmlDocument, "img");
  const resizeHandleElement = createYeonDomElement(htmlDocument, "span");
  const sizeLabelElement = createYeonDomElement(htmlDocument, "span");
  let currentWidth = parseCardEditorImageWidth(props.node.attrs.width);
  let currentHeight = parseOptionalCardEditorImageHeight(
    props.node.attrs.height
  );
  let endResize: (() => void) | undefined;

  // node attrs가 SoT다. undo/redo/외부 setContent로 attrs가 바뀌었을 때 stale 로컬값을
  // 믿지 않도록, 드래그 시작 시점에 문서에서 최신 width/height를 직접 읽는다.
  const readLiveSize = () => {
    const pos = props.getPos();
    const node =
      typeof pos === "number" ? props.view.state.doc.nodeAt(pos) : null;
    const attrs = node?.attrs ?? props.node.attrs;
    return {
      width: parseCardEditorImageWidth(attrs.width),
      height: parseOptionalCardEditorImageHeight(attrs.height),
    };
  };

  // 명시 height가 없을 때(비율 유지) 현재 표시 높이를 추정한다. 라벨/Shift 시작점에 쓴다.
  const measureDisplayHeight = (width: number) => {
    if (currentHeight !== null) {
      return currentHeight;
    }
    if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
      return Math.round(
        (width * imageElement.naturalHeight) / imageElement.naturalWidth
      );
    }
    const measured = Math.round(imageElement.getBoundingClientRect().height);
    if (measured > 0) {
      return measured;
    }
    return imageElement.offsetHeight > 0 ? imageElement.offsetHeight : width;
  };

  // 명시 height가 있으면 aspect-ratio + height:auto로 적용해, 좁은 폭(max-width:100%)에서도
  // 지정한 W:H 비율을 유지하며 함께 축소되도록 한다(height 고정 시 발생하는 왜곡 방지).
  const applyImageSize = (width: number, height: number | null) => {
    setYeonElementStyleProperty(wrapperElement, "width", `${width}px`);
    setYeonElementStyleProperty(imageElement, "width", `${width}px`);
    setYeonElementStyleProperty(imageElement, "height", "auto");
    if (height === null) {
      removeYeonElementStyleProperty(imageElement, "aspect-ratio");
    } else {
      setYeonElementStyleProperty(
        imageElement,
        "aspect-ratio",
        `${width} / ${height}`
      );
    }
  };

  const renderSizeLabel = (width: number, height: number) => {
    setYeonNodeTextContent(sizeLabelElement, `${width} × ${height}px`);
  };

  const applyAttributes = (attrs: Record<string, unknown>) => {
    currentWidth = parseCardEditorImageWidth(attrs.width);
    currentHeight = parseOptionalCardEditorImageHeight(attrs.height);
    imageElement.src = typeof attrs.src === "string" ? attrs.src : "";
    imageElement.alt = typeof attrs.alt === "string" ? attrs.alt : "";
    imageElement.title = typeof attrs.title === "string" ? attrs.title : "";
    applyImageSize(currentWidth, currentHeight);
  };

  wrapperElement.className = "card-rich-editor-image";
  wrapperElement.contentEditable = "false";
  resizeHandleElement.className = "card-rich-editor-image-handle";
  setYeonElementAttribute(resizeHandleElement, "aria-hidden", "true");
  sizeLabelElement.className = "card-rich-editor-image-size";

  applyAttributes(props.node.attrs);
  wrapperElement.append(imageElement, resizeHandleElement, sizeLabelElement);

  resizeHandleElement.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const live = readLiveSize();
    currentWidth = live.width;
    currentHeight = live.height;

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = live.width;
    const startHeightExplicit = live.height;
    const startHeight = measureDisplayHeight(startWidth);
    // 코너 드래그에서 세로 이동도 width에 반영하기 위한 환산 비율(width/height).
    const naturalRatio =
      imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0
        ? imageElement.naturalWidth / imageElement.naturalHeight
        : startHeight > 0
          ? startWidth / startHeight
          : 1;

    addYeonElementClass(wrapperElement, "is-resizing");

    const handlePointerMove = (moveEvent: YeonDocumentPointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      let nextWidth: number;
      let nextHeight: number | null;

      if (moveEvent.shiftKey) {
        // Shift: 비율 해제. width/height를 독립적으로 조절한다.
        nextWidth = clampCardEditorImageWidth(startWidth + dx);
        nextHeight = clampCardEditorImageHeight(startHeight + dy);
      } else {
        // 기본: 비율 유지. 우하단 코너의 가로·세로 이동 중 큰 쪽으로 폭을 정하고
        // height는 auto로 두어 브라우저가 원본 비율을 유지하게 한다.
        const widthDeltaFromY = dy * naturalRatio;
        const dominantDelta =
          Math.abs(dx) >= Math.abs(widthDeltaFromY) ? dx : widthDeltaFromY;
        nextWidth = clampCardEditorImageWidth(startWidth + dominantDelta);
        nextHeight = null;
      }

      currentWidth = nextWidth;
      currentHeight = nextHeight;
      applyImageSize(nextWidth, nextHeight);
      renderSizeLabel(nextWidth, nextHeight ?? measureDisplayHeight(nextWidth));
    };

    let removePointerMove: () => void = () => undefined;
    let removePointerUp: () => void = () => undefined;
    let removePointerCancel: () => void = () => undefined;

    const cleanup = () => {
      removeYeonElementClass(wrapperElement, "is-resizing");
      removePointerMove();
      removePointerUp();
      removePointerCancel();
      endResize = undefined;
    };

    function handlePointerUp(upEvent: YeonDocumentPointerEvent) {
      handlePointerMove(upEvent);
      updateImageNodeSize(props, currentWidth, currentHeight);
      cleanup();
    }

    function handlePointerCancel() {
      // 취소 시에는 커밋하지 않고 시작 크기로 되돌린다.
      currentWidth = startWidth;
      currentHeight = startHeightExplicit;
      applyImageSize(startWidth, startHeightExplicit);
      cleanup();
    }

    removePointerMove = addYeonDocumentEventListener(
      "pointermove",
      handlePointerMove
    );
    removePointerUp = addYeonDocumentEventListener(
      "pointerup",
      handlePointerUp
    );
    removePointerCancel = addYeonDocumentEventListener(
      "pointercancel",
      handlePointerCancel
    );
    endResize = cleanup;
  });

  return {
    dom: wrapperElement,
    update: (nextNode: typeof props.node) => {
      if (nextNode.type !== props.node.type) return false;
      applyAttributes(nextNode.attrs);
      return true;
    },
    selectNode: () => addYeonElementClass(wrapperElement, "is-selected"),
    deselectNode: () => removeYeonElementClass(wrapperElement, "is-selected"),
    stopEvent: (event: Event) => event.target === resizeHandleElement,
    destroy: () => {
      endResize?.();
      removeYeonElementClass(wrapperElement, "is-resizing");
    },
  };
}

export const ResizableCardEditorImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
        parseHTML: (element: YeonElement) =>
          parseCardEditorImageWidth(getYeonElementAttribute(element, "width")),
        renderHTML: (attributes: Record<string, unknown>) => ({
          width: String(parseCardEditorImageWidth(attributes.width)),
        }),
      },
      height: {
        default: null,
        parseHTML: (element: YeonElement) =>
          parseOptionalCardEditorImageHeight(
            getYeonElementAttribute(element, "height")
          ),
        renderHTML: (attributes: Record<string, unknown>) => {
          const height = parseOptionalCardEditorImageHeight(attributes.height);
          return height === null ? {} : { height: String(height) };
        },
      },
    };
  },

  addNodeView() {
    return (props) => createResizableImageNodeView(props);
  },
});

export const CardEditorYouTubeEmbedExtension = Node.create({
  name: "youtubeEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: YeonElement) => {
          return extractCardEditorYouTubeEmbedInfo(
            getYeonElementAttribute(element, "src") ?? ""
          )?.embedUrl;
        },
      },
      title: {
        default: "YouTube video player",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[src]",
        getAttrs: (node) => {
          const target = node as YeonEventTarget | null;
          const element = isYeonElement(target) ? target : null;
          const src = extractCardEditorYouTubeEmbedInfo(
            getYeonElementAttribute(element, "src") ?? ""
          )?.embedUrl;

          if (!src) {
            return false;
          }

          return {
            src,
            title:
              getYeonElementAttribute(element, "title")?.trim() ||
              "YouTube video player",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = buildCardEditorYouTubeEmbedAttrs(HTMLAttributes.src ?? "");

    if (!attrs) {
      return ["p"];
    }

    return ["iframe", mergeAttributes(attrs)];
  },
});
