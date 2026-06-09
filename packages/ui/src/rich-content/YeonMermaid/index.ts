export type YeonMermaidTheme = "dark" | "neutral";

export type YeonMermaidRenderOptions = {
  code: string;
  elementId: string;
  theme?: YeonMermaidTheme;
};

const YEON_MERMAID_FONT_FAMILY =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export async function renderYeonMermaidSvg({
  code,
  elementId,
  theme = "neutral",
}: YeonMermaidRenderOptions) {
  const { default: mermaid } = await import("mermaid");

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme,
    fontFamily: YEON_MERMAID_FONT_FAMILY,
  });

  const result = await mermaid.render(elementId, code);
  return result.svg;
}

export async function mountYeonMermaidDiagram(
  host: HTMLElement,
  options: YeonMermaidRenderOptions
) {
  try {
    host.innerHTML = await renderYeonMermaidSvg(options);
    return true;
  } catch (error) {
    console.warn("[yeon-mermaid] 다이어그램 렌더링 실패", error);
    host.innerHTML = "";
    const fallback = host.ownerDocument.createElement("pre");
    const fallbackCode = host.ownerDocument.createElement("code");
    fallbackCode.textContent = options.code;
    fallback.append(fallbackCode);
    host.append(fallback);
    return false;
  }
}
