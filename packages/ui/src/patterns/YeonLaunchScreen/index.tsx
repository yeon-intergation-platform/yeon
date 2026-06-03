import { YeonImage } from "../../primitives/YeonImage";
import { YeonView } from "../../primitives/YeonView";

export type YeonLaunchScreenProps = {
  imageAlt?: string;
  imageSrc: string;
};

export function YeonLaunchScreen({
  imageAlt = "",
  imageSrc,
}: YeonLaunchScreenProps) {
  return (
    <YeonView className="flex min-h-dvh items-center justify-center bg-white">
      <YeonImage
        alt={imageAlt}
        src={imageSrc}
        className="h-full w-full object-contain"
      />
    </YeonView>
  );
}
