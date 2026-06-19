import type { ErrorResponseMeta } from "@yeon/api-contract/error";

export class ServiceError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** code + 상황별 확장 메타데이터(없으면 message만 내보낸다). */
    public readonly detail?: ErrorResponseMeta
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
