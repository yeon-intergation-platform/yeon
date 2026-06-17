import type { PublicContentArticle } from "./public-content-data";
import { getPublicContentNewsDetailSections } from "./public-content-news-detail";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

function getArticleSlug(article: PublicContentArticle) {
  return article.slugSegments.join("/");
}

export function PublicContentNewsDetailSections({
  article,
}: {
  article: PublicContentArticle;
}) {
  const sections = getPublicContentNewsDetailSections(article);
  if (sections.length === 0) return null;

  return (
    <section
      aria-labelledby="news-detail-sections-title"
      className="mt-6 rounded-lg border border-[#e5e5e5] bg-white p-4"
    >
      <p
        id="news-detail-sections-title"
        className="text-[13px] font-semibold text-[#111]"
      >
        핵심 확인 사항
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {sections.map((section, index) => {
          const sectionId = `news-detail-section-${index}`;

          return (
            <section
              key={section.title}
              aria-labelledby={sectionId}
              className="min-w-0 border-t border-[#e5e5e5] pt-4 first:border-t-0 first:pt-0 md:border-l md:border-t-0 md:pl-4 md:pt-0 md:first:border-l-0 md:first:pl-0"
            >
              <h2
                id={sectionId}
                className="text-[15px] font-semibold text-[#111]"
              >
                {section.title}
              </h2>
              <p className="mt-3 text-[13px] leading-6 text-[#555]">
                {section.body}
              </p>
              {section.links && section.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {section.links.map((link) => (
                    <PublicContentTrackedLink
                      key={`${section.title}-${link.href}`}
                      href={link.href}
                      className="rounded-lg border border-[#d4d4d4] bg-white px-3 py-2 text-[12px] font-semibold text-[#555] no-underline transition-colors hover:border-[#111] hover:text-[#111]"
                      trackingParams={{
                        category: article.category,
                        channel: article.channel,
                        link_kind: "article_card",
                        service: article.service,
                        slug: getArticleSlug(article),
                        source_title: article.title,
                        target_title: link.label,
                      }}
                    >
                      {link.label}
                    </PublicContentTrackedLink>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}
