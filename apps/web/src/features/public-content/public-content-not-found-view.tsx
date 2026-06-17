import { PublicContentArticleCard } from "./public-content-article-card";
import {
  getPublicContentNotFoundArticles,
  getPublicContentNotFoundHomeLink,
} from "./public-content-not-found";
import {
  getPublicContentChannelConfig,
  type PublicContentChannel,
} from "./public-content-data";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

export function PublicContentNotFound({
  channel,
}: {
  channel: PublicContentChannel;
}) {
  const config = getPublicContentChannelConfig(channel);
  const homeLink = getPublicContentNotFoundHomeLink(channel);
  const articles = getPublicContentNotFoundArticles(channel);

  return (
    <main className="min-h-screen bg-white text-[#111]">
      <section className="mx-auto max-w-5xl px-6 py-16 md:px-8 md:py-24">
        <p className="text-[13px] font-semibold text-[#aaa]">{config.label}</p>
        <h1 className="mt-4 text-[36px] font-semibold leading-tight text-[#111] md:text-[48px]">
          문서를 찾지 못했습니다
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#666]">
          주소가 바뀌었거나 아직 공개되지 않은 글입니다. 같은 채널의 홈이나 최근
          글에서 필요한 내용을 다시 찾을 수 있습니다.
        </p>
        <PublicContentTrackedLink
          href={homeLink.href}
          className="mt-8 inline-flex rounded-lg bg-[#111] px-4 py-2 text-[14px] font-semibold text-white no-underline"
          trackingParams={{
            channel,
            link_kind: "not_found_home",
            target_title: homeLink.label,
          }}
        >
          {homeLink.label}
        </PublicContentTrackedLink>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-16 md:px-8">
        <h2 className="text-[20px] font-semibold text-[#111]">최근 글</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <PublicContentArticleCard
              key={article.slugSegments.join("/")}
              article={article}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
