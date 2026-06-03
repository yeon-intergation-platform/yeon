import type {
  YeonBaseElement,
  YeonTableCellElement,
  YeonTableRowElement,
  YeonTableElement,
  YeonDocument,
} from "@yeon/ui/types";
import {
  appendYeonChild,
  cloneYeonNode,
  createYeonDomElement,
  getYeonElementChildren,
  getYeonNodeTextContent,
  getYeonHtmlBodyInnerHtml,
  isYeonElementTagName,
  parseYeonHtmlDocument,
  queryYeonElement,
  queryYeonElements,
  removeYeonElement,
  replaceYeonElementWith,
  setYeonNodeTextContent,
} from "@yeon/ui/rich-content/YeonRichDom";

const MARKDOWN_TABLE_SEPARATOR_CELL_PATTERN = /^:?-{3,}:?$/;
const CARD_EDITOR_UNSAFE_TABLE_SELECTOR = "img,video,audio,iframe,canvas,svg";

export function normalizeCardEditorTableCell(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function splitCardEditorMarkdownTableRow(line: string) {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) {
    return [];
  }

  const normalized = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
  const withoutTrailingPipe = normalized.endsWith("|")
    ? normalized.slice(0, -1)
    : normalized;

  return withoutTrailingPipe.split("|").map(normalizeCardEditorTableCell);
}

export function isCardEditorMarkdownTableSeparatorRow(line: string) {
  const cells = splitCardEditorMarkdownTableRow(line);

  return (
    cells.length >= 2 &&
    cells.every((cell) => MARKDOWN_TABLE_SEPARATOR_CELL_PATTERN.test(cell))
  );
}

export function isCardEditorMarkdownTableBlock(lines: readonly string[]) {
  if (
    lines.length < 2 ||
    !isCardEditorMarkdownTableSeparatorRow(lines[1] ?? "")
  ) {
    return false;
  }

  const headerCells = splitCardEditorMarkdownTableRow(lines[0] ?? "");
  const separatorCells = splitCardEditorMarkdownTableRow(lines[1] ?? "");

  return (
    headerCells.length >= 2 && headerCells.length === separatorCells.length
  );
}

function appendCells(
  htmlDocument: YeonDocument,
  rowElement: YeonTableRowElement,
  tagName: "td" | "th",
  cells: readonly string[]
) {
  cells.forEach((cell) => {
    const cellElement = createYeonDomElement(htmlDocument, tagName);
    setYeonNodeTextContent(cellElement, cell);
    appendYeonChild(rowElement, cellElement);
  });
}

export function createCardEditorMarkdownTableRow(cells: readonly string[]) {
  return `| ${cells.map(normalizeCardEditorTableCell).join(" | ")} |`;
}

export function normalizeCardEditorMarkdownTableLines(
  lines: readonly string[]
) {
  if (!isCardEditorMarkdownTableBlock(lines)) {
    return undefined;
  }

  const parsedRows = lines.map(splitCardEditorMarkdownTableRow);
  const columnCount = Math.max(...parsedRows.map((cells) => cells.length));
  const normalizedRows = parsedRows.map((cells, rowIndex) =>
    Array.from({ length: columnCount }, (_, cellIndex) => {
      if (rowIndex === 1) return "---";
      const cell = cells[cellIndex];
      return cell === undefined ? "" : cell;
    })
  );

  return normalizedRows.map(createCardEditorMarkdownTableRow);
}

function createTableElement(
  htmlDocument: YeonDocument,
  lines: readonly string[]
) {
  const table = createYeonDomElement(htmlDocument, "table");
  const thead = createYeonDomElement(htmlDocument, "thead");
  const tbody = createYeonDomElement(htmlDocument, "tbody");
  const headerRow = createYeonDomElement(htmlDocument, "tr");

  appendCells(
    htmlDocument,
    headerRow,
    "th",
    splitCardEditorMarkdownTableRow(lines[0] ?? "")
  );
  appendYeonChild(thead, headerRow);

  lines.slice(2).forEach((line) => {
    const cells = splitCardEditorMarkdownTableRow(line);
    if (cells.length === 0) {
      return;
    }

    const bodyRow = createYeonDomElement(htmlDocument, "tr");
    appendCells(htmlDocument, bodyRow, "td", cells);
    appendYeonChild(tbody, bodyRow);
  });

  appendYeonChild(table, thead);
  appendYeonChild(table, tbody);

  return table;
}

export function convertCardEditorTabularTextToMarkdownTable(text: string) {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split("\t").map(normalizeCardEditorTableCell))
    .filter((cells) => cells.length >= 2 && cells.some(Boolean));

  if (rows.length === 0) {
    return undefined;
  }

  const columnCount = Math.max(...rows.map((cells) => cells.length));
  if (columnCount < 2) {
    return undefined;
  }

  const normalizedRows = rows.map((cells) =>
    Array.from({ length: columnCount }, (_, index) =>
      cells[index] === undefined ? "" : cells[index]
    )
  );
  const header = normalizedRows[0] === undefined ? [] : normalizedRows[0];
  const bodyRows = normalizedRows.slice(1);
  const separator = Array.from({ length: columnCount }, () => "---");
  return [
    createCardEditorMarkdownTableRow(header),
    createCardEditorMarkdownTableRow(separator),
    ...bodyRows.map(createCardEditorMarkdownTableRow),
  ].join("\n");
}

export function convertCardEditorHtmlTableElementToMarkdownTable(
  table: YeonBaseElement
) {
  const rows = queryYeonElements<YeonTableRowElement>(table, "tr")
    .map((row) =>
      queryYeonElements<YeonTableCellElement>(row, "th,td").map((cell) =>
        normalizeCardEditorTableCell(getYeonNodeTextContent(cell))
      )
    )
    .filter((cells) => cells.length >= 2 && cells.some(Boolean));

  if (rows.length === 0) {
    return undefined;
  }

  return convertCardEditorTabularTextToMarkdownTable(
    rows.map((cells) => cells.join("\t")).join("\n")
  );
}

export function convertCardEditorHtmlTableToMarkdownTable(html: string) {
  if (!html.trim()) {
    return undefined;
  }

  const htmlDocument = parseYeonHtmlDocument(html);
  if (!htmlDocument) {
    return undefined;
  }

  const tables = queryYeonElements<YeonTableElement>(htmlDocument, "table");
  if (tables.length !== 1) {
    return undefined;
  }

  const table = tables[0];
  if (!table) {
    return undefined;
  }

  return convertCardEditorHtmlTableElementToMarkdownTable(table);
}

export function isCardEditorHtmlTableOnlyPaste(html: string) {
  if (!html.trim()) {
    return false;
  }

  const htmlDocument = parseYeonHtmlDocument(html);
  if (!htmlDocument) {
    return false;
  }

  const tables = queryYeonElements<YeonTableElement>(htmlDocument, "table");
  if (tables.length !== 1) {
    return false;
  }

  const table = tables[0];
  if (!table || queryYeonElement(table, CARD_EDITOR_UNSAFE_TABLE_SELECTOR)) {
    return false;
  }

  const body = cloneYeonNode(htmlDocument.body, true);
  queryYeonElements(body, "script,style,meta,link,table").forEach((element) =>
    removeYeonElement(element)
  );

  if (normalizeCardEditorTableCell(getYeonNodeTextContent(body))) {
    return false;
  }

  return !queryYeonElement(body, CARD_EDITOR_UNSAFE_TABLE_SELECTOR);
}

export function renderCardEditorMarkdownTablesInHtml(html: string) {
  if (!html.trim()) {
    return html;
  }

  const htmlDocument = parseYeonHtmlDocument(html);
  if (!htmlDocument) {
    return html;
  }

  const children = getYeonElementChildren(htmlDocument.body);
  let index = 0;

  while (index < children.length) {
    const child = children[index];
    if (!child || !isYeonElementTagName(child, "p")) {
      index += 1;
      continue;
    }

    const lines: string[] = [];
    const paragraphElements: YeonBaseElement[] = [];
    let nextIndex = index;

    while (nextIndex < children.length) {
      const nextChild = children[nextIndex];
      if (!nextChild || !isYeonElementTagName(nextChild, "p")) {
        break;
      }

      const line = normalizeCardEditorTableCell(
        getYeonNodeTextContent(nextChild)
      );
      if (!line.includes("|")) {
        break;
      }

      lines.push(line);
      paragraphElements.push(nextChild);
      nextIndex += 1;
    }

    if (isCardEditorMarkdownTableBlock(lines)) {
      const table = createTableElement(htmlDocument, lines);
      replaceYeonElementWith(paragraphElements[0], table);
      paragraphElements.slice(1).forEach(removeYeonElement);
      index = nextIndex;
      continue;
    }

    index += 1;
  }

  return getYeonHtmlBodyInnerHtml(htmlDocument);
}
