export function parseYeonHtmlDocument(_html: string) {
  return null;
}

export function getYeonHtmlBodyInnerHtml(_htmlDocument: unknown) {
  return "";
}

export function getYeonHtmlVisibleText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createYeonDomElement(_htmlDocument: unknown, _tagName: string) {
  return null;
}

export function queryYeonElements(_root: unknown, _selector: string) {
  return [];
}

export function queryYeonElement(_root: unknown, _selector: string) {
  return null;
}

export function cloneYeonNode<TNode>(node: TNode, _deep = true) {
  return node;
}

export function appendYeonChild(_parent: unknown, _child: unknown) {}

export function appendYeonChildren(_parent: unknown, ..._children: unknown[]) {}

export function insertYeonBefore(
  _parent: unknown,
  _newNode: unknown,
  _referenceNode: unknown
) {}

export function removeYeonElement(_element: unknown) {}

export function replaceYeonElementWith(
  _element: unknown,
  _replacement: unknown
) {}

export function getYeonNodeTextContent(_node: unknown) {
  return "";
}

export function setYeonNodeTextContent(_node: unknown, _value: string) {}

export function setYeonElementStyleProperty(
  _element: unknown,
  _propertyName: string,
  _value: string
) {}

export function removeYeonElementStyleProperty(
  _element: unknown,
  _propertyName: string
) {}

export function getYeonElementAttribute(_element: unknown, _name: string) {
  return null;
}

export function setYeonElementAttribute(
  _element: unknown,
  _name: string,
  _value: string
) {}

export function removeYeonElementAttribute(_element: unknown, _name: string) {}

export function hasYeonElementAttribute(_element: unknown, _name: string) {
  return false;
}

export function getYeonElementTagName(_element: unknown) {
  return "";
}

export function isYeonElementTagName(_element: unknown, _tagName: string) {
  return false;
}

export function getYeonElementChildren(_element: unknown) {
  return [];
}

export function getYeonOwnerDocument(_element: unknown) {
  return null;
}

export function addYeonElementClass(_element: unknown, _className: string) {}

export function removeYeonElementClass(_element: unknown, _className: string) {}

export function hasYeonElementClass(_element: unknown, _className: string) {
  return false;
}

export function isYeonElement(_target: unknown) {
  return false;
}

export function getYeonClosestElement(_target: unknown, _selector: string) {
  return null;
}
