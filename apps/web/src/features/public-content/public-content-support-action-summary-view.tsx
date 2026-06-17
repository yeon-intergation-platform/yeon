type PublicContentSupportActionSummaryProps = {
  items: readonly string[];
};

export function PublicContentSupportActionSummary({
  items,
}: PublicContentSupportActionSummaryProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="support-primary-action-heading"
      className="mt-8 max-w-[760px] border-l-2 border-[#111] pl-4"
    >
      <h2
        id="support-primary-action-heading"
        className="text-[14px] font-semibold text-[#111]"
      >
        먼저 확인할 것
      </h2>
      <ol className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={item}
            className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 text-[14px] leading-6 text-[#333]"
          >
            <span className="font-semibold text-[#111]">{index + 1}</span>
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
