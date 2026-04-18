import { runSimulationTick } from "@/lib/services/greenhouseService";
import { fail, ok } from "@/lib/api/http";

export async function POST() {
  try {
    const state = await runSimulationTick();
    return ok({ state });
  } catch {
    return fail(
      "SIMULATION_TICK_FAILED",
      "Khong the mo phong tick hien tai",
      500,
    );
  }
}
