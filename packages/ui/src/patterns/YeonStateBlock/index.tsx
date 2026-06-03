import { YeonSpinner } from "../../primitives/YeonSpinner";
import { YeonSurface } from "../../primitives/YeonSurface";
import { YeonText } from "../../primitives/YeonText";

export type YeonStateBlockProps = {
  loading?: boolean;
  message: string;
  title: string;
};

export function YeonStateBlock({
  loading = false,
  message,
  title,
}: YeonStateBlockProps) {
  return (
    <YeonSurface
      variant="card"
      className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-3xl p-5 text-center"
    >
      {loading ? <YeonSpinner /> : null}
      <YeonText variant="subtitle" className="text-center text-[18px]">
        {title}
      </YeonText>
      <YeonText
        variant="body"
        tone="secondary"
        className="text-center text-[14px] leading-5"
      >
        {message}
      </YeonText>
    </YeonSurface>
  );
}
