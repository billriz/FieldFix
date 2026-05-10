import { approveFix, rejectFix } from "@/app/admin/actions";
import { createClient } from "@/utils/supabase/server";

type PendingFix = {
  id: string;
  title: string;
  machine_type: string | null;
  manufacturer: string | null;
  model: string | null;
  error_code: string | null;
  symptoms: string | null;
  fix_steps: string[] | null;
  parts_used: string[] | null;
  created_at: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently submitted";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function cleanList(values: string[] | null | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fixes")
    .select(
      "id,title,machine_type,manufacturer,model,error_code,symptoms,fix_steps,parts_used,created_at",
    )
    .eq("approved", false)
    .order("created_at", { ascending: false });

  const pendingFixes = (data ?? []) as PendingFix[];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            Admin
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Review submitted fixes before publishing.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500">{pendingFixes.length} pending</p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          Pending fixes could not be loaded: {error.message}
        </p>
      ) : null}

      {!error && pendingFixes.length === 0 ? (
        <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No pending submissions.
        </p>
      ) : null}

      <div className="space-y-3">
        {pendingFixes.map((fix) => {
          const steps = cleanList(fix.fix_steps);
          const parts = cleanList(fix.parts_used);

          return (
            <article
              key={fix.id}
              className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {fix.machine_type ?? "Unspecified"}
                    </span>
                    {fix.manufacturer ? (
                      <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-900">
                        {fix.manufacturer}
                      </span>
                    ) : null}
                    {fix.model ? (
                      <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                        {fix.model}
                      </span>
                    ) : null}
                    {fix.error_code ? (
                      <span className="rounded bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                        {fix.error_code}
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold leading-6 text-slate-950">{fix.title}</h2>
                    <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                      {fix.symptoms ?? "No symptoms provided."}
                    </p>
                  </div>

                  {steps.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Fix steps
                      </p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
                        {steps.slice(0, 4).map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  {parts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {parts.map((part) => (
                        <span
                          key={part}
                          className="rounded border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-3 lg:w-40 lg:grid-cols-1">
                  <p className="col-span-2 text-sm text-slate-500 lg:col-span-1 lg:text-right">
                    {formatDate(fix.created_at)}
                  </p>
                  <form action={approveFix}>
                    <input type="hidden" name="fix_id" value={fix.id} />
                    <button
                      type="submit"
                      className="min-h-10 w-full rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectFix}>
                    <input type="hidden" name="fix_id" value={fix.id} />
                    <button
                      type="submit"
                      className="min-h-10 w-full rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
