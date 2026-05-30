import type { ReactNode } from "react";

type ServiceSeoFeature = { title: string; description: string };
type ServiceSeoFaq = { question: string; answer: string };

interface ServiceSeoSectionProps {
  heading: string;
  intro: readonly string[];
  features?: readonly ServiceSeoFeature[];
  faqs?: readonly ServiceSeoFaq[];
  children?: ReactNode;
}

/**
 * 서버 컴포넌트. 클라이언트 앱(로딩 셸) 아래에 크롤 가능한 고유 텍스트(소개·기능·FAQ)를
 * 초기 HTML로 렌더해 검색 색인 품질을 확보한다. 색인 안 되던 원인(thin SSR)을 해결하는 핵심.
 */
export function ServiceSeoSection({
  heading,
  intro,
  features,
  faqs,
  children,
}: ServiceSeoSectionProps) {
  return (
    <section
      aria-label={heading}
      className="border-t border-[#e5e5e5] bg-white"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-12 text-[#111] sm:px-6">
        <h2 className="text-[24px] font-bold leading-snug tracking-[-0.01em] [word-break:keep-all] sm:text-[28px]">
          {heading}
        </h2>
        <div className="mt-4 space-y-3 text-[15px] leading-7 text-[#555] [word-break:keep-all]">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {features && features.length > 0 ? (
          <div className="mt-12 border-t border-[#e5e5e5] pt-8">
            <h3 className="text-[19px] font-bold tracking-[-0.01em] text-[#111]">
              주요 기능
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4"
                >
                  <p className="flex items-start gap-2 text-[15px] font-semibold text-[#111] [word-break:keep-all]">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] h-[6px] w-[6px] flex-none rounded-full bg-[#111]"
                    />
                    {feature.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-6 text-[#555] [word-break:keep-all]">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {children}

        {faqs && faqs.length > 0 ? (
          <div className="mt-12 border-t border-[#e5e5e5] pt-8">
            <h3 className="text-[19px] font-bold tracking-[-0.01em] text-[#111]">
              자주 묻는 질문
            </h3>
            <div className="mt-4 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-[#e5e5e5] [&[open]]:bg-[#fafafa]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-[15px] font-semibold text-[#111] [word-break:keep-all] [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="flex-none text-[18px] leading-none text-[#aaa] transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-[14px] leading-6 text-[#555] [word-break:keep-all]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
