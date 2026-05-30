import { ServiceSeoSection } from "@/components/service-seo-section";

import {
  COMMUNITY_CATEGORY_DESCRIPTIONS,
  COMMUNITY_SEO_HEADING,
  COMMUNITY_SEO_INTRO,
} from "./community-content";
import { WRITABLE_CATEGORIES } from "./community-post-format";

export interface CommunitySeoPost {
  category: string;
  title: string;
  content: string;
}

/**
 * 서버 컴포넌트. 커뮤니티 페이지 초기 HTML에 게시판 소개·분류·최근 글을 렌더해
 * 크롤러가 빈 셸 대신 실제 콘텐츠를 받게 한다. recentPosts는 서버에서 미리 파싱해 전달한다.
 */
export function CommunitySeoSection({
  recentPosts,
}: {
  recentPosts: readonly CommunitySeoPost[];
}) {
  return (
    <ServiceSeoSection
      heading={COMMUNITY_SEO_HEADING}
      intro={COMMUNITY_SEO_INTRO}
    >
      <div className="mt-8">
        <h3 className="text-[16px] font-semibold text-[#111]">게시판 종류</h3>
        <ul className="mt-3 space-y-3">
          {WRITABLE_CATEGORIES.map((category) => (
            <li key={category} className="break-keep">
              <span className="text-[14px] font-semibold text-[#111]">
                {category}
              </span>
              <span className="mt-0.5 block text-[13px] leading-6 text-[#666]">
                {COMMUNITY_CATEGORY_DESCRIPTIONS[category]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {recentPosts.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-[16px] font-semibold text-[#111]">최근 글</h3>
          <ul className="mt-3 space-y-3">
            {recentPosts.map((post, index) => (
              <li
                key={`${index}-${post.title}`}
                className="rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm"
              >
                <span className="inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-0.5 text-[12px] font-semibold text-[#555]">
                  {post.category}
                </span>
                <p className="mt-2 line-clamp-1 break-keep text-[16px] font-semibold text-[#111]">
                  {post.title}
                </p>
                {post.content ? (
                  <p className="mt-1 line-clamp-2 break-keep text-[14px] leading-6 text-[#666]">
                    {post.content}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </ServiceSeoSection>
  );
}
