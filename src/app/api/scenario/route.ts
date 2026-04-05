import { NextResponse } from "next/server";
import { setScenario } from "@/lib/services/greenhouseService";
import { ScenarioType } from "@/lib/types/domain";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: ScenarioType;
  };

  if (!body.mode) {
    return NextResponse.json(
      { error: "Bắt buộc cung cấp mode kịch bản" },
      { status: 400 },
    );
  }

  const state = await setScenario(body.mode);
  return NextResponse.json({ state });
}
