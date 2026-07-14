import type { PublicContentArticle } from "./public-content-data";
import { PublicContentArticleCard } from "./public-content-article-card";

export function PublicContentSupportSearch({
  query,
  results,
}: {
  query: string;
  results: readonly PublicContentArticle[];
}) {
  const hasQuery = query.length > 0;

  return (
    <section
      id="support-search"
      aria-labelledby="support-search-title"
      className="mx-auto max-w-6xl px-6 pb-8 md:px-8"
    >
      <div className="border border-[#e5e5e5] bg-[#fafafa] p-5 md:p-6">
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold text-[#555]">문제 검색</p>
          <h2
            id="support-search-title"
            className="mt-1 text-[26px] font-semibold tracking-[-0.03em] text-[#111]"
          >
            어떤 도움이 필요하신가요?
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#666]">
            문서 제목이나 겪고 있는 문제를 입력하면 관련 도움말을 먼저
            보여드려요.
          </p>
        </div>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row" role="search">
          <label className="sr-only" htmlFor="support-search-input">
            도움말 검색
          </label>
          <input
            id="support-search-input"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="예: 로그인할 수 없어요, Provider 연결, 카드 가져오기"
            className="h-12 min-w-0 flex-1 border border-[#111] bg-white px-4 text-[15px] text-[#111] outline-none placeholder:text-[#666] focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2"
          />
          <button
            type="submit"
            className="h-12 shrink-0 bg-[#111] px-6 text-[14px] font-semibold text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
          >
            검색
          </button>
        </form>
        <p className="mt-3 text-[12px] leading-5 text-[#666]">
          예: 로그인, NEXA 권한, 타자 기록, 덱 만들기
        </p>
      </div>

      {hasQuery ? (
        <section
          aria-live="polite"
          aria-labelledby="support-search-result-title"
          className="mt-8"
        >
          <div className="flex flex-col gap-2 border-b border-[#e5e5e5] pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#555]">검색 결과</p>
              <h2
                id="support-search-result-title"
                className="mt-1 text-[24px] font-semibold text-[#111]"
              >
                “{query}”와 관련된 문서 {results.length}개
              </h2>
            </div>
            <a
              href="#support-services"
              className="w-fit text-[13px] font-semibold text-[#555] underline underline-offset-4 transition-colors hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
            >
              서비스별로 찾기
            </a>
          </div>
          {results.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((article) => (
                <PublicContentArticleCard
                  key={article.slugSegments.join("/")}
                  article={article}
                />
              ))}
            </div>
          ) : (
            <p className="mt-5 max-w-2xl text-[14px] leading-6 text-[#666]">
              일치하는 문서를 찾지 못했습니다. 아래에서 서비스를 선택하거나,
              페이지 마지막의 문의 경로로 알려주세요.
            </p>
          )}
        </section>
      ) : null}
    </section>
  );
}
