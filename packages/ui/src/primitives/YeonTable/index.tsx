import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

import { joinClassNames } from "../../utils";

export type YeonTableProps = TableHTMLAttributes<HTMLTableElement>;
export type YeonTableSectionProps = HTMLAttributes<HTMLTableSectionElement>;
export type YeonTableRowProps = HTMLAttributes<HTMLTableRowElement>;
export type YeonTableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement>;
export type YeonTableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export function YeonTable({ className, ...props }: YeonTableProps) {
  return (
    <table
      className={joinClassNames(
        "w-full border-collapse text-[14px] text-[#666]",
        className
      )}
      {...props}
    />
  );
}

export function YeonTableHead({ className, ...props }: YeonTableSectionProps) {
  return <thead className={joinClassNames(className)} {...props} />;
}

export function YeonTableBody({ className, ...props }: YeonTableSectionProps) {
  return <tbody className={joinClassNames(className)} {...props} />;
}

export function YeonTableRow({ className, ...props }: YeonTableRowProps) {
  return <tr className={joinClassNames(className)} {...props} />;
}

export function YeonTableHeaderCell({
  className,
  ...props
}: YeonTableHeaderCellProps) {
  return (
    <th
      className={joinClassNames(
        "border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-2.5 text-left text-[13px] font-semibold text-[#111]",
        className
      )}
      {...props}
    />
  );
}

export function YeonTableCell({ className, ...props }: YeonTableCellProps) {
  return (
    <td
      className={joinClassNames(
        "border-b border-[#e5e5e5] px-3 py-2.5 text-[#666]",
        className
      )}
      {...props}
    />
  );
}
