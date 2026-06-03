import { type ReactNode } from "react";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_AUTH_CLASS } from "@yeon/ui/theme/web-style-tokens";

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <YeonView as="main" className={YEON_WEB_AUTH_CLASS.pageSurface}>
      <YeonView className={YEON_WEB_AUTH_CLASS.frame560}>
        <YeonView as="section" className={YEON_WEB_AUTH_CLASS.panel}>
          <YeonView className={YEON_WEB_AUTH_CLASS.headerStack}>
            {eyebrow ? (
              <YeonText
                variant="unstyled"
                tone="inherit"
                className={YEON_WEB_AUTH_CLASS.eyebrow}
              >
                {eyebrow}
              </YeonText>
            ) : null}
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={YEON_WEB_AUTH_CLASS.title}
            >
              {title}
            </YeonText>
            {description ? (
              <YeonText
                variant="unstyled"
                tone="inherit"
                className={YEON_WEB_AUTH_CLASS.description}
              >
                {description}
              </YeonText>
            ) : null}
          </YeonView>
          {children}
          {footer ? <YeonView className="grid gap-2">{footer}</YeonView> : null}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
