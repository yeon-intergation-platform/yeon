import { NextResponse } from "next/server";
import { createErrorResponseBody } from "@/server/bff-error";

export function jsonPublicContentError(message: string, status: number) {
  return NextResponse.json(createErrorResponseBody(message, status), {
    status,
  });
}
