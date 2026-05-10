"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

export async function approveFix(formData: FormData) {
  const fixId = String(formData.get("fix_id") ?? "");

  if (!fixId) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("fixes")
    .update({
      approved: true,
      status: "open",
    })
    .eq("id", fixId)
    .eq("approved", false);

  revalidatePath("/admin");
  revalidatePath("/search");
}

export async function rejectFix(formData: FormData) {
  const fixId = String(formData.get("fix_id") ?? "");

  if (!fixId) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("fixes").delete().eq("id", fixId).eq("approved", false);

  revalidatePath("/admin");
}
