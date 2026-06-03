import { YeonImage } from "../../primitives/YeonImage";
import { joinClassNames } from "../../utils";
import { createYeonInitials } from "../utils/create-yeon-initials";

export type YeonAvatarCircleTone = "accent" | "neutral";

export type YeonAvatarCircleProps = {
  imageUrl?: string | null;
  label: string;
  size?: number;
  tone?: YeonAvatarCircleTone;
};

export function YeonAvatarCircle({
  imageUrl,
  label,
  size = 48,
  tone = "accent",
}: YeonAvatarCircleProps) {
  const style = { height: size, width: size };

  if (imageUrl) {
    return (
      <YeonImage
        alt={label}
        src={imageUrl}
        style={{ ...style, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <span
      aria-label={label}
      className={joinClassNames(
        "inline-flex items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[15px] font-extrabold tracking-[0.03em]",
        tone === "accent" ? "text-[#111]" : "text-[#666]"
      )}
      style={style}
    >
      {createYeonInitials(label)}
    </span>
  );
}
