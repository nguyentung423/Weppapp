import { NextResponse } from "next/server";
import { getCurrentState } from "@/lib/services/greenhouseService";

export async function GET() {
  return NextResponse.json({ state: getCurrentState() });
}
