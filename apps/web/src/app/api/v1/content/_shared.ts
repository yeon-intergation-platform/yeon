import { errorResponseSchema } from "@yeon/api-contract/error";
import { NextResponse } from "next/server";

export function jsonPublicContentError(message: string, status: number) {
  return NextResponse.json(errorResponseSchema.parse({ message }), { status });
}
