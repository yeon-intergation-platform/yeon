import { YeonMarkdownContent } from "@yeon/ui";
import { getPublicContentMarkdownHeadings } from "./public-content-markdown";

export function PublicContentMarkdownView({
  markdown,
  className = "",
}: {
  markdown: string;
  className?: string;
}) {
  const headingIdByLine = new Map(
    getPublicContentMarkdownHeadings(markdown).map((heading) => [
      heading.line,
      heading.id,
    ])
  );
  const getHeadingId = (node?: { position?: { start?: { line?: number } } }) =>
    headingIdByLine.get(node?.position?.start?.line ?? -1);

  return (
    <div className={`min-w-0 space-y-6 ${className}`}>
      <YeonMarkdownContent
        components={{
          h2: ({ children, node }) => (
            <h2
              id={getHeadingId(node)}
              className="scroll-mt-24 pt-4 text-[24px] font-semibold text-[#111]"
            >
              {children}
            </h2>
          ),
          h3: ({ children, node }) => (
            <h3
              id={getHeadingId(node)}
              className="scroll-mt-24 pt-3 text-[20px] font-semibold text-[#111]"
            >
              {children}
            </h3>
          ),
          h4: ({ children, node }) => (
            <h4
              id={getHeadingId(node)}
              className="scroll-mt-24 pt-2 text-[18px] font-semibold text-[#111]"
            >
              {children}
            </h4>
          ),
          h5: ({ children, node }) => (
            <h5
              id={getHeadingId(node)}
              className="scroll-mt-24 pt-2 text-[16px] font-semibold text-[#111]"
            >
              {children}
            </h5>
          ),
          h6: ({ children, node }) => (
            <h6
              id={getHeadingId(node)}
              className="scroll-mt-24 pt-2 text-[15px] font-semibold text-[#111]"
            >
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="text-[16px] leading-8 text-[#222]">{children}</p>
          ),
          ul: ({ children }) => <ul className="space-y-2 pl-5">{children}</ul>,
          ol: ({ children }) => (
            <ol className="list-decimal space-y-3 pl-6">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 text-[15px] leading-7 text-[#222]">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="rounded-lg border border-[#d6d6d6] bg-[#fafafa] px-5 py-4 text-[14px] leading-7 text-[#444]">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              className="font-semibold text-[#333] underline underline-offset-4 hover:text-[#111]"
              href={href}
              rel="noreferrer"
              target={href?.startsWith("http") ? "_blank" : undefined}
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg border border-[#333] bg-[#111] p-4 text-[13px] leading-6 text-[#f5f5f5]">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="rounded bg-[#f1f1f1] px-1.5 py-0.5 text-[0.9em] text-[#222]">
              {children}
            </code>
          ),
          img: ({ alt, src }) => (
            <img
              alt={alt ?? ""}
              className="h-auto max-w-full rounded-lg border border-[#e5e5e5]"
              loading="lazy"
              src={src ?? ""}
            />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[14px]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[#d6d6d6] bg-[#fafafa] px-3 py-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#d6d6d6] px-3 py-2">{children}</td>
          ),
        }}
      >
        {markdown}
      </YeonMarkdownContent>
    </div>
  );
}
