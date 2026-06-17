import type { PublicContentBlock } from "./public-content-data";
import {
  getPublicContentCodeBlockLabel,
  getPublicContentImageAspectRatioStyle,
} from "./public-content-block-style";

type PublicContentBlockViewProps = {
  block: PublicContentBlock;
  headingId?: string;
};

export function PublicContentBlockView({
  block,
  headingId,
}: PublicContentBlockViewProps) {
  if (block.type === "paragraph") {
    return <p className="text-[16px] leading-8 text-[#111]">{block.text}</p>;
  }

  if (block.type === "heading") {
    return (
      <h2
        id={headingId}
        className="scroll-mt-24 pt-4 text-[24px] font-semibold text-[#111]"
      >
        {block.title}
      </h2>
    );
  }

  if (block.type === "steps") {
    return (
      <ol className="space-y-4">
        {block.items.map((item, itemIndex) => (
          <li
            key={item}
            className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 text-[15px] leading-7 text-[#111]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d6d6d6] bg-white text-[13px] font-semibold text-[#111]">
              {itemIndex + 1}
            </span>
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === "checklist") {
    return (
      <ul className="space-y-3">
        {block.items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-7 text-[#111]"
          >
            <span className="mt-2 h-2 w-2 shrink-0 rounded-lg bg-[#111]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#fafafa]">
        <div style={getPublicContentImageAspectRatioStyle(block)}>
          <img
            alt={block.alt}
            className="h-full w-full object-cover"
            decoding="async"
            height={block.height}
            loading="lazy"
            src={block.src}
            width={block.width}
          />
        </div>
        {block.caption ? (
          <figcaption className="border-t border-[#e5e5e5] px-4 py-3 text-[13px] leading-6 text-[#666]">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "code") {
    const label = getPublicContentCodeBlockLabel(block);

    return (
      <figure className="overflow-hidden rounded-lg border border-[#d6d6d6] bg-[#111]">
        {label ? (
          <figcaption className="border-b border-[#333] bg-[#1a1a1a] px-4 py-2 text-[12px] font-semibold text-[#d6d6d6]">
            {label}
          </figcaption>
        ) : null}
        <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-6 text-[#f5f5f5]">
          <code>{block.code}</code>
        </pre>
      </figure>
    );
  }

  return (
    <aside className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-5">
      <p className="text-[14px] font-semibold text-[#111]">{block.title}</p>
      <p className="mt-2 text-[14px] leading-6 text-[#666]">{block.text}</p>
    </aside>
  );
}
