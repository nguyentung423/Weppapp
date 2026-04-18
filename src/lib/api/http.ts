import { NextResponse } from "next/server";
import { ApiFailure, ApiMeta, ApiSuccess } from "@/lib/api/contracts";

function buildMeta(requestId?: string): ApiMeta {
  return {
    requestId: requestId ?? crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

export function ok<T>(data: T, status = 200, requestId?: string) {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    meta: buildMeta(requestId),
  };

  return NextResponse.json(body, { status });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
  requestId?: string,
) {
  const body: ApiFailure = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: buildMeta(requestId),
  };

  return NextResponse.json(body, { status });
}

export async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
