"use client";

import { useEffect, useId, useState } from "react";
import { CircleHelp, X } from "lucide-react";

import { ProductHeaderSettingsButton } from "./product-header";

export type ServiceHelpFeature = {
  title: string;
  description: string;
};

export type ServiceHelpFaq = {
  question: string;
  answer: string;
};

export type ServiceHelpContent = {
  title: string;
  intro: readonly string[];
  features?: readonly ServiceHelpFeature[];
  faqs?: readonly ServiceHelpFaq[];
};

type ServiceHelpDialogProps = {
  content: ServiceHelpContent;
};

export function ServiceHelpDialog({ content }: ServiceHelpDialogProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <>
      <ProductHeaderSettingsButton
        type="button"
        aria-label="도움말"
        title="도움말"
        onClick={() => setOpen(true)}
      >
        <CircleHelp size={17} />
      </ProductHeaderSettingsButton>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,17,17,0.72)] p-4"
          onClick={() => setOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[min(720px,calc(100vh-32px))] w-[min(100%,720px)] overflow-hidden rounded-[28px] border border-[#e5e5e5] bg-white text-[#111] shadow-[0_28px_80px_rgba(17,17,17,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="service-help-scrollbar max-h-[min(720px,calc(100vh-32px))] overflow-y-auto px-6 py-6 pr-4 sm:px-8 sm:py-8 sm:pr-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="m-0 text-[12px] font-bold uppercase tracking-[0.18em] text-[#aaa]">
                    도움말
                  </p>
                  <h2
                    id={titleId}
                    className="mt-2 text-[24px] font-black leading-tight tracking-[-0.035em] text-[#111] sm:text-[30px]"
                  >
                    {content.title}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="도움말 닫기"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[#666] transition-colors hover:border-[#aaa] hover:bg-white hover:text-[#111]"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-3 text-[15px] leading-7 text-[#666] [word-break:keep-all]">
                {content.intro.map((paragraph) => (
                  <p key={paragraph} className="m-0">
                    {paragraph}
                  </p>
                ))}
              </div>

              {content.features && content.features.length > 0 ? (
                <div className="mt-8 border-t border-[#e5e5e5] pt-6">
                  <h3 className="text-[18px] font-black tracking-[-0.01em] text-[#111]">
                    주요 기능
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {content.features.map((feature) => (
                      <li
                        key={feature.title}
                        className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4"
                      >
                        <p className="flex items-start gap-2 text-[15px] font-bold text-[#111] [word-break:keep-all]">
                          <span
                            aria-hidden="true"
                            className="mt-[7px] h-[6px] w-[6px] flex-none rounded-full bg-[#111]"
                          />
                          {feature.title}
                        </p>
                        <p className="mt-1 text-[14px] leading-6 text-[#666] [word-break:keep-all]">
                          {feature.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {content.faqs && content.faqs.length > 0 ? (
                <div className="mt-8 border-t border-[#e5e5e5] pt-6">
                  <h3 className="text-[18px] font-black tracking-[-0.01em] text-[#111]">
                    자주 묻는 질문
                  </h3>
                  <div className="mt-4 space-y-3">
                    {content.faqs.map((faq) => (
                      <details
                        key={faq.question}
                        className="group rounded-2xl border border-[#e5e5e5] [&[open]]:bg-[#fafafa]"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-[15px] font-bold text-[#111] [word-break:keep-all] [&::-webkit-details-marker]:hidden">
                          <span>{faq.question}</span>
                          <span
                            aria-hidden="true"
                            className="flex-none text-[18px] leading-none text-[#aaa] transition-transform group-open:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        <p className="px-4 pb-4 text-[14px] leading-6 text-[#666] [word-break:keep-all]">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
