import { askAssistant } from "@/lib/services/greenhouseService";
import { fail, ok, readJsonBody } from "@/lib/api/http";

export async function POST(request: Request) {
  const body = (await readJsonBody<{
    question?: string;
  }>(request)) ?? { question: undefined };

  const question = body.question?.trim();
  if (!question) {
    return fail("MISSING_QUESTION", "Bat buoc cung cap cau hoi", 400);
  }

  try {
    return ok({ answer: askAssistant(question) });
  } catch {
    return fail(
      "ASSISTANT_QUERY_FAILED",
      "Khong the xu ly cau hoi tro ly luc nay",
      500,
    );
  }
}
