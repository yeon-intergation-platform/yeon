"use client";
import { YeonText, YeonView } from "@yeon/ui";
import { FLOW_STEPS } from "./landing-constants";
import { RevealSection } from "./reveal-section";

export function LandingFlowSection() {
  return (
    <RevealSection className="relative z-[1] bg-white px-12 py-[120px] pb-[140px] md:px-6">
      <YeonView id="flow" className="mx-auto grid max-w-[800px] gap-[72px]">
        <YeonView>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="m-0 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#666]"
          >
            사용 흐름
          </YeonText>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="m-0 text-[clamp(28px,4vw,48px)] font-black leading-[1.15] tracking-[-0.025em] text-[#111]"
          >
            시작부터 저장까지 단순하게
          </YeonText>
        </YeonView>

        <YeonView className="grid gap-0">
          {FLOW_STEPS.map((step) => (
            <YeonView
              key={step.number}
              className="flex items-start gap-7 border-b border-[#e5e5e5] py-9 first:border-t first:border-[#e5e5e5] md:gap-5 md:py-7"
            >
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="w-[68px] shrink-0 font-mono text-[44px] font-black leading-none tracking-[-0.04em] text-[#111] tabular-nums md:w-[52px] md:text-[36px]"
              >
                {step.number}
              </YeonText>
              <YeonView className="grid gap-1.5 pt-2">
                <YeonText
                  as="h3"
                  variant="unstyled"
                  tone="inherit"
                  className="m-0 text-[21px] font-bold text-[#111]"
                >
                  {step.title}
                </YeonText>
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="m-0 text-[15px] leading-[1.65] text-[#666]"
                >
                  {step.description}
                </YeonText>
              </YeonView>
            </YeonView>
          ))}
        </YeonView>
      </YeonView>
    </RevealSection>
  );
}
