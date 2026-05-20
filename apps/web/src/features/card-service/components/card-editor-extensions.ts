import ImageExtension from "@tiptap/extension-image";
import {
  mergeAttributes,
  Node,
  type NodeViewRendererProps,
} from "@tiptap/core";

import {
  CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
  clampCardEditorImageWidth,
  parseCardEditorImageWidth,
} from "./card-editor-image-utils";
import {
  buildCardEditorYouTubeEmbedAttrs,
  extractCardEditorYouTubeEmbedInfo,
} from "./card-editor-youtube-utils";

function updateImageNodeWidth(props: NodeViewRendererProps, nextWidth: number) {
  const pos = props.getPos();
  if (typeof pos !== "number") return;

  const currentNode = props.view.state.doc.nodeAt(pos);
  if (!currentNode) return;

  props.view.dispatch(
    props.view.state.tr.setNodeMarkup(pos, undefined, {
      ...currentNode.attrs,
      width: clampCardEditorImageWidth(nextWidth),
    })
  );
}

function createResizableImageNodeView(props: NodeViewRendererProps) {
  const wrapperElement = document.createElement("span");
  const imageElement = document.createElement("img");
  const resizeHandleElement = document.createElement("span");
  const sizeLabelElement = document.createElement("span");
  let currentWidth = parseCardEditorImageWidth(props.node.attrs.width);
  let removePointerListeners: (() => void) | undefined;

  const applyAttributes = (attrs: Record<string, unknown>) => {
    const nextWidth = parseCardEditorImageWidth(attrs.width);
    currentWidth = nextWidth;
    wrapperElement.style.width = `${nextWidth}px`;
    imageElement.src = typeof attrs.src === "string" ? attrs.src : "";
    imageElement.alt = typeof attrs.alt === "string" ? attrs.alt : "";
    imageElement.title = typeof attrs.title === "string" ? attrs.title : "";
    imageElement.width = nextWidth;
    imageElement.style.width = `${nextWidth}px`;
    imageElement.style.height = "auto";
    sizeLabelElement.textContent = `표시 크기: ${nextWidth}px × auto`;
  };

  wrapperElement.className = "card-rich-editor-image";
  wrapperElement.contentEditable = "false";
  resizeHandleElement.className = "card-rich-editor-image-handle";
  resizeHandleElement.setAttribute("aria-hidden", "true");
  sizeLabelElement.className = "card-rich-editor-image-size";

  applyAttributes(props.node.attrs);
  imageElement.addEventListener("load", () => {
    sizeLabelElement.textContent = `표시 크기: ${currentWidth}px × auto · 원본 크기: ${imageElement.naturalWidth} × ${imageElement.naturalHeight}px`;
  });
  wrapperElement.append(imageElement, resizeHandleElement, sizeLabelElement);

  resizeHandleElement.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = currentWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = clampCardEditorImageWidth(
        startWidth + moveEvent.clientX - startX
      );
      currentWidth = nextWidth;
      wrapperElement.style.width = `${nextWidth}px`;
      imageElement.width = nextWidth;
      imageElement.style.width = `${nextWidth}px`;
      sizeLabelElement.textContent = `표시 크기: ${nextWidth}px × auto · 원본 크기: ${imageElement.naturalWidth} × ${imageElement.naturalHeight}px`;
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

export const ResizableCardEditorImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: CARD_EDITOR_IMAGE_DEFAULT_WIDTH,
        parseHTML: (element: HTMLElement) =>
          parseCardEditorImageWidth(element.getAttribute("width")),
        renderHTML: (attributes: Record<string, unknown>) => ({
          width: String(parseCardEditorImageWidth(attributes.width)),
        }),
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
        parseHTML: (element: HTMLElement) => {
          return extractCardEditorYouTubeEmbedInfo(
            element.getAttribute("src") ?? ""
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
          const element = node instanceof HTMLElement ? node : null;
          const src = extractCardEditorYouTubeEmbedInfo(
            element?.getAttribute("src") ?? ""
          )?.embedUrl;

          if (!src) {
            return false;
          }

          return {
            src,
            title:
              element?.getAttribute("title")?.trim() || "YouTube video player",
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
