"use client";
import { YeonIcon, YeonText, YeonView } from "@yeon/ui";
import { FEATURES } from "./landing-constants";
import { RevealSection } from "./reveal-section";

export function LandingFeaturesSection() {
  return (
    <RevealSection className="relative z-[1] bg-white px-12 py-[120px] pb-[140px] md:px-6">
      <YeonView
        id="features"
        className="mx-auto grid max-w-[1100px] gap-[72px]"
      >
        <YeonView>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="m-0 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#666]"
          >
            핵심 기능
          </YeonText>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="m-0 whitespace-pre-line text-[clamp(28px,4vw,48px)] font-black leading-[1.15] tracking-[-0.025em] text-[#111]"
          >
            {"상담기록이 관리와 보고로\n바로 이어집니다"}
          </YeonText>
        </YeonView>

        <YeonView className="grid grid-cols-2 gap-5 md:grid-cols-1">
          {FEATURES.map((feat) => (
            <YeonView
              key={feat.title}
              className="grid cursor-default gap-4 rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-10 transition-[border-color,box-shadow,transform] duration-[350ms] ease-in-out hover:-translate-y-2 hover:border-[#aaa] hover:bg-white hover:shadow-[0_24px_56px_rgba(17,17,17,0.08)] md:p-8"
            >
              <YeonView className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e5e5e5] bg-white text-[#111]">
                <YeonIcon name={feat.icon} size={24} strokeWidth={2} />
              </YeonView>
              <YeonText
                as="h3"
                variant="unstyled"
                tone="inherit"
                className="m-0 text-[21px] font-bold text-[#111]"
              >
                {feat.title}
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="m-0 text-[15px] leading-[1.75] text-[#666]"
              >
                {feat.description}
              </YeonText>
            </YeonView>
          ))}
        </YeonView>
      </YeonView>
    </RevealSection>
  );
}
