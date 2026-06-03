import { YeonButton } from "../../primitives/YeonButton";
import { YeonText } from "../../primitives/YeonText";
import { YeonView } from "../../primitives/YeonView";

export type YeonRouteFallbackScreenProps = {
  href: string;
  linkLabel: string;
  title: string;
};

export function YeonRouteFallbackScreen({
  href,
  linkLabel,
  title,
}: YeonRouteFallbackScreenProps) {
  return (
    <YeonView className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white p-6">
      <YeonText variant="subtitle" className="text-center text-[22px]">
        {title}
      </YeonText>
      <YeonButton as="a" href={href} variant="pill">
        {linkLabel}
      </YeonButton>
    </YeonView>
  );
}
