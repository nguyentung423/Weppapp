import { fail, ok, readJsonBody } from "@/lib/api/http";
import {
  applyDeviceControlCommand,
  getCurrentState,
  getDeviceControls,
} from "@/lib/services/greenhouseService";
import {
  ControlSource,
  DeviceControlCommand,
  DeviceControlPatch,
} from "@/lib/types/control";

const ALLOWED_CONTROL_KEYS: Array<keyof DeviceControlPatch> = [
  "waterPumpEnabled",
  "nutrientPumpEnabled",
  "growLightsEnabled",
  "mistingEnabled",
  "fanEnabled",
  "fanSpeed",
  "co2PumpEnabled",
  "curtainPercent",
];

const ALLOWED_SOURCES: ControlSource[] = ["dashboard", "openclaw", "api"];

function hasUnknownKeys(controls: Record<string, unknown>) {
  return Object.keys(controls).some(
    (key) => !ALLOWED_CONTROL_KEYS.includes(key as keyof DeviceControlPatch),
  );
}

function validatePatch(controls: DeviceControlPatch): string[] {
  const errors: string[] = [];

  if (
    controls.waterPumpEnabled != null &&
    typeof controls.waterPumpEnabled !== "boolean"
  ) {
    errors.push("waterPumpEnabled phai la boolean");
  }
  if (
    controls.nutrientPumpEnabled != null &&
    typeof controls.nutrientPumpEnabled !== "boolean"
  ) {
    errors.push("nutrientPumpEnabled phai la boolean");
  }
  if (
    controls.growLightsEnabled != null &&
    typeof controls.growLightsEnabled !== "boolean"
  ) {
    errors.push("growLightsEnabled phai la boolean");
  }
  if (
    controls.mistingEnabled != null &&
    typeof controls.mistingEnabled !== "boolean"
  ) {
    errors.push("mistingEnabled phai la boolean");
  }
  if (controls.fanEnabled != null && typeof controls.fanEnabled !== "boolean") {
    errors.push("fanEnabled phai la boolean");
  }
  if (
    controls.co2PumpEnabled != null &&
    typeof controls.co2PumpEnabled !== "boolean"
  ) {
    errors.push("co2PumpEnabled phai la boolean");
  }

  if (controls.fanSpeed != null) {
    if (
      typeof controls.fanSpeed !== "number" ||
      !Number.isFinite(controls.fanSpeed)
    ) {
      errors.push("fanSpeed phai la so hop le");
    } else if (controls.fanSpeed < 0 || controls.fanSpeed > 100) {
      errors.push("fanSpeed phai nam trong khoang 0-100");
    }
  }

  if (controls.curtainPercent != null) {
    if (
      typeof controls.curtainPercent !== "number" ||
      !Number.isFinite(controls.curtainPercent)
    ) {
      errors.push("curtainPercent phai la so hop le");
    } else if (controls.curtainPercent < 0 || controls.curtainPercent > 100) {
      errors.push("curtainPercent phai nam trong khoang 0-100");
    }
  }

  return errors;
}

export async function GET() {
  try {
    const controls = getDeviceControls();
    return ok({ controls });
  } catch {
    return fail(
      "CONTROL_STATE_READ_FAILED",
      "Khong the lay trang thai dieu khien",
      500,
    );
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody<DeviceControlCommand>(request);
  if (!body || typeof body !== "object") {
    return fail("INVALID_BODY", "Body JSON khong hop le", 400);
  }

  const controls = body.controls;
  if (!controls || typeof controls !== "object") {
    return fail("MISSING_CONTROLS", "Bat buoc cung cap controls", 400);
  }

  if (hasUnknownKeys(controls as Record<string, unknown>)) {
    return fail(
      "UNKNOWN_CONTROL_FIELD",
      "Co truong controls khong duoc ho tro",
      400,
      { allowedKeys: ALLOWED_CONTROL_KEYS },
    );
  }

  if (body.source && !ALLOWED_SOURCES.includes(body.source)) {
    return fail("INVALID_SOURCE", "source khong hop le", 400, {
      allowedSources: ALLOWED_SOURCES,
    });
  }

  const validationErrors = validatePatch(controls);
  if (validationErrors.length > 0) {
    return fail(
      "INVALID_CONTROL_VALUES",
      "Gia tri controls khong hop le",
      400,
      {
        errors: validationErrors,
      },
    );
  }

  try {
    const result = applyDeviceControlCommand({
      controls,
      source: body.source ?? "api",
    });

    return ok({
      ...result,
      state: getCurrentState(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CONTROL_PATCH") {
      return fail(
        "EMPTY_CONTROL_PATCH",
        "Khong co truong controls hop le de cap nhat",
        400,
      );
    }

    return fail(
      "CONTROL_APPLY_FAILED",
      "Khong the ap dung lenh dieu khien",
      500,
    );
  }
}
