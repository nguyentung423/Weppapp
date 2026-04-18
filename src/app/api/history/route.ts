import { getHistory } from "@/lib/services/greenhouseService";
import { fail, ok } from "@/lib/api/http";

function parseWindowParam(value: string | null): 30 | 120 | null {
  if (!value || value === "30m") return 30;
  if (value === "2h") return 120;
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const window = parseWindowParam(url.searchParams.get("window"));
  if (!window) {
    return fail(
      "INVALID_WINDOW",
      "Gia tri window khong hop le. Chap nhan: 30m hoac 2h",
      400,
    );
  }

  const history = await getHistory(window);

  return ok({ window, history });
}
