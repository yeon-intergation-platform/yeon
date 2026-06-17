import type { PublicContentArticle } from "./public-content-data";
import type { PublicContentBlogDetailModel } from "./public-content-blog-detail";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

function RelatedLinkList({
  links,
}: {
  links: PublicContentBlogDetailModel["supportLinks"];
}) {
  if (links.length === 0) {
    return <p className="text-[13px] leading-6 text-[#777]">연결 글 준비 중</p>;
  }

  return (
    <ul className="mt-3 space-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <PublicContentTrackedLink
            href={link.href}
            className="text-[13px] font-semibold leading-6 text-[#555] underline underline-offset-4 transition-colors hover:text-[#111]"
            trackingParams={{
              channel: "blog",
              link_kind: "related_article",
              target_title: link.title,
            }}
          >
            {link.title}
          </PublicContentTrackedLink>
        </li>
      ))}
    </ul>
  );
}

export function PublicContentBlogArticleContextPanel({
  article,
  model,
}: {
  article: PublicContentArticle;
  model: PublicContentBlogDetailModel | null;
}) {
  if (!model) return null;

  return (
    <aside className="mt-8 grid gap-4 border-y border-[#e5e5e5] py-5 md:grid-cols-3">
      <section>
        <p className="text-[12px] font-semibold text-[#aaa]">운영 주체</p>
        <p className="mt-2 text-[14px] font-semibold text-[#111]">
          {model.authorName}
        </p>
        <p className="mt-1 text-[13px] leading-6 text-[#666]">
          {model.authorDescription}
        </p>
      </section>
      <section>
        <p className="text-[12px] font-semibold text-[#aaa]">관련 support</p>
        <RelatedLinkList links={model.supportLinks} />
      </section>
      <section>
        <p className="text-[12px] font-semibold text-[#aaa]">관련 공식 소식</p>
        <RelatedLinkList links={model.newsLinks} />
      </section>
      {model.repoSourceLinks.length > 0 ? (
        <section className="md:col-span-3">
          <p className="text-[12px] font-semibold text-[#aaa]">repo 근거</p>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {model.repoSourceLinks.map((link) => (
              <li key={link.href} className="min-w-0">
                <PublicContentTrackedLink
                  href={link.href}
                  className="block truncate rounded-lg border border-[#e5e5e5] px-3 py-2 text-[12px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
                  trackingParams={{
                    category: article.category,
                    channel: article.channel,
                    link_kind: "source",
                    service: article.service,
                    target_title: link.label,
                  }}
                >
                  {link.label}
                </PublicContentTrackedLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
