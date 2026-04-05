import { NextResponse } from "next/server";
import { getHistory } from "@/lib/services/greenhouseService";

function parseWindowParam(value: string | null) {
  if (value === "2h") return 120;
  return 30;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const window = parseWindowParam(url.searchParams.get("window"));
  const history = await getHistory(window);

  return NextResponse.json({
    window,
    history,
  });
}
