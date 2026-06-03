import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { NextResponse } from "next/server";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8081";
const BACKEND_HEALTH_PATH = "/actuator/health";

function resolveBackendBaseUrl() {
  const raw = process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

export async function GET() {
  const backendBaseUrl = resolveBackendBaseUrl();
  const targetUrl = `${backendBaseUrl}${BACKEND_HEALTH_PATH}`;

  try {
    const response = await fetchYeon(targetUrl, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    const upstreamBody = await response.text();

    return NextResponse.json(
      {
        ok: response.ok,
        targetUrl,
        upstreamStatus: response.status,
        upstreamBody,
      },
      {
        status: response.ok ? 200 : 502,
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "backend health fetch failed";

    return NextResponse.json(
      {
        ok: false,
        targetUrl,
        message,
      },
      {
        status: 502,
      }
    );
  }
}
