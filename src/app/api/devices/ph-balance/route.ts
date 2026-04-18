import { fail, ok, readJsonBody } from "@/lib/api/http";
import {
  applyPhAdjustmentCommand,
  getCurrentState,
} from "@/lib/services/greenhouseService";
import {
  ControlSource,
  PhAdjustmentCommand,
  PhAdjustmentMode,
} from "@/lib/types/control";

const ALLOWED_SOURCES: ControlSource[] = ["dashboard", "openclaw", "api"];
const ALLOWED_MODES: PhAdjustmentMode[] = ["ph_high", "ph_low"];

function validateDrops(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "drops phai la so hop le";
  }
  if (value < 1 || value > 20) {
    return "drops phai nam trong khoang 1-20";
  }
  return null;
}

export async function POST(request: Request) {
  const body = await readJsonBody<PhAdjustmentCommand>(request);
  if (!body || typeof body !== "object") {
    return fail("INVALID_BODY", "Body JSON khong hop le", 400);
  }

  if (!ALLOWED_MODES.includes(body.mode)) {
    return fail("INVALID_PH_MODE", "mode khong hop le", 400, {
      allowedModes: ALLOWED_MODES,
    });
  }

  const dropError = validateDrops(body.drops);
  if (dropError) {
    return fail("INVALID_DROPS", dropError, 400);
  }

  if (body.source && !ALLOWED_SOURCES.includes(body.source)) {
    return fail("INVALID_SOURCE", "source khong hop le", 400, {
      allowedSources: ALLOWED_SOURCES,
    });
  }

  try {
    const adjustment = applyPhAdjustmentCommand({
      source: body.source ?? "api",
      mode: body.mode,
      drops: body.drops,
    });

    return ok({
      adjustment,
      state: getCurrentState(),
    });
  } catch {
    return fail(
      "PH_ADJUSTMENT_FAILED",
      "Khong the ap dung lenh can bang pH",
      500,
    );
  }
}
