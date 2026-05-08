import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

type FeedbackRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type FeedbackResult = {
  failure_count: number;
  success_count: number;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: FeedbackRouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { success?: unknown } | null;

  if (typeof body?.success !== "boolean") {
    return NextResponse.json({ message: "Feedback choice is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_fix_feedback", {
    target_fix_id: id,
    was_success: body.success,
  });

  if (error) {
    return NextResponse.json(
      { message: error.message || "Feedback could not be recorded." },
      { status: error.message === "Fix not found" ? 404 : 500 },
    );
  }

  const [result] = (data ?? []) as FeedbackResult[];

  if (!result) {
    return NextResponse.json({ message: "Feedback could not be recorded." }, { status: 500 });
  }

  return NextResponse.json({
    failureCount: result.failure_count,
    successCount: result.success_count,
  });
}
