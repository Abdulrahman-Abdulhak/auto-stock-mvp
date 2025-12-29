import { NextResponse } from "next/server";

/**
 * Health-check endpoint.
 *
 * This route provides a lightweight signal that the application runtime
 * is reachable and capable of producing a valid response.
 *
 * It is intended for monitoring, diagnostics, and automated checks rather
 * than application-specific business logic.
 *
 * The response payload is intentionally minimal and non-sensitive.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
  });
}
