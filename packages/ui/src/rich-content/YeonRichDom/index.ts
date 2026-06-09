const YEON_HTML_MIME_TYPE = "text/html";

type YeonDomParserConstructor = typeof DOMParser;

interface YeonDomParserPort {
  getParserConstructor(): YeonDomParserConstructor | undefined;
}

const YEON_DOM_PARSER_PORT: YeonDomParserPort = {
  getParserConstructor() {
    if (typeof globalThis.DOMParser !== "undefined") {
      return globalThis.DOMParser;
    }

    return undefined;
  },
};

function getYeonDomParser() {
  return YEON_DOM_PARSER_PORT.getParserConstructor();
}

export function parseYeonHtmlDocument(html: string) {
  const Parser = getYeonDomParser();
  if (!Parser) {
    return null;
  }

  return new Parser().parseFromString(html, YEON_HTML_MIME_TYPE);
}

export function getYeonHtmlBodyInnerHtml(
  htmlDocument: Document | null | undefined
) {
  return htmlDocument?.body.innerHTML ?? "";
}

export function getYeonHtmlVisibleText(html: string) {
  const htmlDocument = parseYeonHtmlDocument(html);
  if (!htmlDocument) {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return (htmlDocument.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function createYeonDomElement<K extends keyof HTMLElementTagNameMap>(
  htmlDocument: Document,
  tagName: K
) {
  return htmlDocument.createElement(tagName);
}

export function queryYeonElements<TElement extends Element = Element>(
  root: ParentNode,
  selector: string
) {
  return Array.from(root.querySelectorAll(selector)) as TElement[];
}

export function queryYeonElement<TElement extends Element = Element>(
  root: ParentNode,
  selector: string
) {
  return root.querySelector(selector) as TElement | null;
}

export function cloneYeonNode<TNode extends Node>(node: TNode, deep = true) {
  return node.cloneNode(deep) as TNode;
}

export function appendYeonChild(parent: Node, child: Node) {
  parent.appendChild(child);
}

export function appendYeonChildren(parent: Element, ...children: Node[]) {
  parent.append(...children);
}

export function insertYeonBefore(
  parent: Node | null | undefined,
  newNode: Node,
  referenceNode: Node | null
) {
  parent?.insertBefore(newNode, referenceNode);
}

export function removeYeonElement(element: Element | null | undefined) {
  element?.remove();
}

export function replaceYeonElementWith(
  element: Element | null | undefined,
  replacement: Element
) {
  element?.replaceWith(replacement);
}

export function getYeonNodeTextContent(node: Node | null | undefined) {
  return node?.textContent ?? "";
}

export function setYeonNodeTextContent(
  node: Node | null | undefined,
  value: string
) {
  if (!node) return;
  node.textContent = value;
}

export function setYeonElementStyleProperty(
  element: HTMLElement | null | undefined,
  propertyName: string,
  value: string
) {
  element?.style.setProperty(propertyName, value);
}

export function removeYeonElementStyleProperty(
  element: HTMLElement | null | undefined,
  propertyName: string
) {
  element?.style.removeProperty(propertyName);
}

export function getYeonElementAttribute(
  element: Element | null | undefined,
  name: string
) {
  return element?.getAttribute(name) ?? null;
}

export function setYeonElementAttribute(
  element: Element | null | undefined,
  name: string,
  value: string
) {
  element?.setAttribute(name, value);
}

export function removeYeonElementAttribute(
  element: Element | null | undefined,
  name: string
) {
  element?.removeAttribute(name);
}

export function hasYeonElementAttribute(
  element: Element | null | undefined,
  name: string
) {
  return Boolean(element?.hasAttribute(name));
}

export function getYeonElementTagName(element: Element | null | undefined) {
  return element?.tagName.toLowerCase() ?? "";
}

export function isYeonElementTagName(
  element: Element | null | undefined,
  tagName: string
) {
  return getYeonElementTagName(element) === tagName.toLowerCase();
}

export function getYeonElementChildren(element: Element | null | undefined) {
  return element ? Array.from(element.children) : [];
}

export function getYeonOwnerDocument(element: Element) {
  return element.ownerDocument;
}

export function addYeonElementClass(
  element: Element | null | undefined,
  className: string
) {
  element?.classList.add(className);
}

export function removeYeonElementClass(
  element: Element | null | undefined,
  className: string
) {
  element?.classList.remove(className);
}

export function hasYeonElementClass(
  element: Element | null | undefined,
  className: string
) {
  return Boolean(element?.classList.contains(className));
}

export function isYeonElement(target: EventTarget | null): target is Element {
  return typeof Element !== "undefined" && target instanceof Element;
}

export function getYeonClosestElement<TElement extends Element = Element>(
  target: EventTarget | null,
  selector: string
) {
  if (!isYeonElement(target)) {
    return null;
  }

  return target.closest(selector) as TElement | null;
}
