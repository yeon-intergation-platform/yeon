import type { ReactNode } from "react";

import {
  YeonLink,
  type YeonLinkProps,
} from "../../primitives/YeonLink/index.native";
import {
  YeonList,
  type YeonListProps,
} from "../../primitives/YeonList/index.native";
import { YeonText } from "../../primitives/YeonText/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonLegalDocumentPageProps = {
  children: ReactNode;
  lastUpdated: string;
  title: string;
};

export type YeonLegalSectionProps = {
  children: ReactNode;
  title: string;
};

export type YeonLegalListProps = YeonListProps;

export type YeonLegalLinkProps = YeonLinkProps;

export function YeonLegalDocumentPage({
  children,
  lastUpdated,
  title,
}: YeonLegalDocumentPageProps) {
  return (
    <YeonView style={styles.page}>
      <YeonText variant="title" style={styles.title}>
        {title}
      </YeonText>
      <YeonText variant="caption" tone="muted" style={styles.updatedAt}>
        최종 수정일: {lastUpdated}
      </YeonText>
      {children}
    </YeonView>
  );
}

export function YeonLegalSection({ children, title }: YeonLegalSectionProps) {
  return (
    <YeonView style={styles.section}>
      <YeonText variant="subtitle" style={styles.sectionTitle}>
        {title}
      </YeonText>
      <YeonView style={styles.sectionBody}>{children}</YeonView>
    </YeonView>
  );
}

export function YeonLegalList(props: YeonLegalListProps) {
  return <YeonList style={styles.list} {...props} />;
}

export function YeonLegalLink(props: YeonLegalLinkProps) {
  return <YeonLink {...props} />;
}

const styles = createYeonStyleSheet({
  page: {
    backgroundColor: yeonMobileAppColors.background,
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    color: yeonMobileAppColors.text,
    marginBottom: 8,
  },
  updatedAt: {
    marginBottom: 36,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    borderBottomColor: yeonMobileAppColors.border,
    borderBottomWidth: 1,
    color: yeonMobileAppColors.text,
    marginBottom: 12,
    paddingBottom: 8,
  },
  sectionBody: {
    gap: 8,
  },
  list: {
    gap: 8,
    marginVertical: 8,
    paddingLeft: 8,
  },
});
