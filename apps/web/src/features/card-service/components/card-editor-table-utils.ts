const MARKDOWN_TABLE_SEPARATOR_CELL_PATTERN = /^:?-{3,}:?$/;

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
  document: Document,
  rowElement: HTMLTableRowElement,
  tagName: "td" | "th",
  cells: readonly string[]
) {
  cells.forEach((cell) => {
    const cellElement = document.createElement(tagName);
    cellElement.textContent = cell;
    rowElement.appendChild(cellElement);
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

function createTableElement(document: Document, lines: readonly string[]) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");

  appendCells(
    document,
    headerRow,
    "th",
    splitCardEditorMarkdownTableRow(lines[0] ?? "")
  );
  thead.appendChild(headerRow);

  lines.slice(2).forEach((line) => {
    const cells = splitCardEditorMarkdownTableRow(line);
    if (cells.length === 0) {
      return;
    }

    const bodyRow = document.createElement("tr");
    appendCells(document, bodyRow, "td", cells);
    tbody.appendChild(bodyRow);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

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
  table: Element
) {
  const rows = Array.from(table.querySelectorAll("tr"))
    .map((row) =>
      Array.from(row.querySelectorAll("th,td")).map((cell) =>
        normalizeCardEditorTableCell(cell.textContent ?? "")
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
  if (typeof window === "undefined" || !html.trim()) {
    return undefined;
  }

  const document = new window.DOMParser().parseFromString(html, "text/html");
  const tables = Array.from(document.querySelectorAll("table"));
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
  if (typeof window === "undefined" || !html.trim()) {
    return false;
  }

  const document = new window.DOMParser().parseFromString(html, "text/html");
  const tables = Array.from(document.querySelectorAll("table"));
  if (tables.length !== 1) {
    return false;
  }

  const table = tables[0];
  if (!table || table.querySelector("img,video,audio,iframe,canvas,svg")) {
    return false;
  }

  const body = document.body.cloneNode(true) as HTMLElement;
  body
    .querySelectorAll("script,style,meta,link,table")
    .forEach((element) => element.remove());

  if (normalizeCardEditorTableCell(body.textContent ?? "")) {
    return false;
  }

  return !body.querySelector("img,video,audio,iframe,canvas,svg");
}

export function renderCardEditorMarkdownTablesInHtml(html: string) {
  if (typeof window === "undefined" || !html.trim()) {
    return html;
  }

  const document = new window.DOMParser().parseFromString(html, "text/html");
  const children = Array.from(document.body.children);
  let index = 0;

  while (index < children.length) {
    const child = children[index];
    if (!child || child.tagName.toLowerCase() !== "p") {
      index += 1;
      continue;
    }

    const lines: string[] = [];
    const paragraphElements: Element[] = [];
    let nextIndex = index;

    while (nextIndex < children.length) {
      const nextChild = children[nextIndex];
      if (!nextChild || nextChild.tagName.toLowerCase() !== "p") {
        break;
      }

      const line = normalizeCardEditorTableCell(nextChild.textContent ?? "");
      if (!line.includes("|")) {
        break;
      }

      lines.push(line);
      paragraphElements.push(nextChild);
      nextIndex += 1;
    }

    if (isCardEditorMarkdownTableBlock(lines)) {
      const table = createTableElement(document, lines);
      paragraphElements[0]?.replaceWith(table);
      paragraphElements.slice(1).forEach((element) => element.remove());
      index = nextIndex;
      continue;
    }

    index += 1;
  }

  return document.body.innerHTML;
}
