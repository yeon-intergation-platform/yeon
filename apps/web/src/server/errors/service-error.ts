import type { ErrorResponseMeta } from "@yeon/api-contract/error";

export class ServiceError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Spring code + 상황별 확장 메타데이터. 없으면 BFF helper가 status 기반 code를 채운다. */
    public readonly detail?: ErrorResponseMeta
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
