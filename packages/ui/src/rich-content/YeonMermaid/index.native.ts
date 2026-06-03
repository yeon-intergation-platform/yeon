export type YeonMermaidTheme = "dark" | "neutral";

export type YeonMermaidRenderOptions = {
  code: string;
  elementId: string;
  theme?: YeonMermaidTheme;
};

export async function renderYeonMermaidSvg(_options: YeonMermaidRenderOptions) {
  return "";
}

export async function mountYeonMermaidDiagram(
  _host: unknown,
  _options: YeonMermaidRenderOptions
) {
  return false;
}
