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
        <h2 className="text-[20px] font-bold tracking-[-0.01em] sm:text-[22px]">
          {heading}
        </h2>
        <div className="mt-3 space-y-3 text-[15px] leading-7 text-[#666]">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {features && features.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-[16px] font-semibold text-[#111]">주요 기능</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4"
                >
                  <p className="text-[15px] font-semibold text-[#111]">
                    {feature.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-6 text-[#666]">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {children}

        {faqs && faqs.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-[16px] font-semibold text-[#111]">
              자주 묻는 질문
            </h3>
            <dl className="mt-3 space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-[#e5e5e5] p-4"
                >
                  <dt className="text-[15px] font-semibold text-[#111]">
                    {faq.question}
                  </dt>
                  <dd className="mt-1 text-[14px] leading-6 text-[#666]">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}
