import { NextResponse } from "next/server";
import { runSimulationTick } from "@/lib/services/greenhouseService";

export async function POST() {
  const state = await runSimulationTick();
  return NextResponse.json({ state });
}
