import type { MemberFieldType as FieldType } from "@yeon/api-contract/spaces";

import { ServiceError } from "./service-error";

export function buildValueColumns(
  fieldType: FieldType,
  value: unknown,
): Partial<{
  valueText: string | null;
  valueNumber: string | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
}> {
  if (value === null || value === undefined) {
    return {
      valueText: null,
      valueNumber: null,
      valueBoolean: null,
      valueJson: null,
    };
  }

  switch (fieldType) {
    case "text":
    case "long_text":
    case "url":
    case "email":
    case "phone":
    case "date":
      return { valueText: String(value).slice(0, 5000) };
    case "number": {
      const n = Number(value);
      if (Number.isNaN(n)) {
        throw new ServiceError(
          400,
          `숫자 필드에 유효하지 않은 값입니다: ${value}`,
        );
      }
      return { valueNumber: String(n) };
    }
    case "checkbox":
      return { valueBoolean: Boolean(value) };
    case "select":
    case "multi_select":
      return { valueJson: value };
    default:
      return { valueText: String(value) };
  }
}
