import { getCurrentStateFresh } from "@/lib/services/greenhouseService";
import { fail, ok } from "@/lib/api/http";

export async function GET() {
  try {
    return ok({ state: await getCurrentStateFresh() });
  } catch {
    return fail("STATE_READ_FAILED", "Khong the lay trang thai nha kinh", 500);
  }
}
