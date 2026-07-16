import {
  Boxes,
  Keyboard,
  Layers2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { PublicContentService } from "./public-content-data";

type PublicContentServiceIconProps = {
  className?: string;
  service: PublicContentService;
  size?: number;
  strokeWidth?: number;
};

export function PublicContentServiceIcon({
  className,
  service,
  size = 22,
  strokeWidth = 1.65,
}: PublicContentServiceIconProps) {
  const iconProps = {
    "aria-hidden": true,
    className,
    size,
    strokeWidth,
  };

  switch (service) {
    case "nexa":
      return <Boxes {...iconProps} />;
    case "typing":
      return <Keyboard {...iconProps} />;
    case "card":
      return <Layers2 {...iconProps} />;
    case "community":
      return <UsersRound {...iconProps} />;
    case "account":
      return <ShieldCheck {...iconProps} />;
  }
}
