import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    supabase = await createClient();
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Supabase is not configured",
      },
      { status: 500 },
    );
  }

  const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: {
      apikey: supabaseKey ?? "",
    },
  });

  if (!settingsResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase connection test failed.",
        status: settingsResponse.status,
      },
      { status: 500 },
    );
  }

  const { data, error } = await supabase.from("todos").select("*").limit(5);

  if (error) {
    if (error.code === "PGRST205") {
      return NextResponse.json({
        ok: true,
        connected: true,
        data: [],
        message:
          "Supabase connection confirmed. No public.todos table exists yet, so returning empty dummy data.",
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          "Supabase connected, but the todos test query failed. Create a todos table or update the route to use an existing table.",
        error: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    data,
  });
}
