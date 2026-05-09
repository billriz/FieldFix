import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

type SubmitFixBody = {
  machine_type?: unknown;
  manufacturer?: unknown;
  model?: unknown;
  error_code?: unknown;
  title?: unknown;
  symptoms?: unknown;
  fix_steps?: unknown;
  parts_used?: unknown;
};

export const dynamic = "force-dynamic";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 25);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SubmitFixBody | null;

  if (!body) {
    return NextResponse.json({ message: "Fix details are required." }, { status: 400 });
  }

  const title = cleanText(body.title);
  const machineType = cleanText(body.machine_type);
  const symptoms = cleanText(body.symptoms);
  const fixSteps = cleanList(body.fix_steps);

  if (!title || !machineType || !symptoms || fixSteps.length === 0) {
    return NextResponse.json(
      { message: "Machine type, title, symptoms, and at least one fix step are required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const fixId = crypto.randomUUID();
  const { error } = await supabase.from("fixes").insert({
    id: fixId,
    machine_type: machineType,
    manufacturer: cleanText(body.manufacturer) || null,
    model: cleanText(body.model) || null,
    error_code: cleanText(body.error_code) || null,
    title,
    symptoms,
    description: symptoms,
    fix_steps: fixSteps,
    parts_used: cleanList(body.parts_used),
    status: "open",
    approved: false,
  });

  if (error) {
    return NextResponse.json(
      { message: error.message || "Fix could not be submitted." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: fixId }, { status: 201 });
}
