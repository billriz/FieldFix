import { SubmitFixForm } from "@/components/submit-fix-form";

export default function SubmitPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
          Submit Fix
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Add a field-tested fix for review before it appears in search.
        </p>
      </div>

      <SubmitFixForm />
    </section>
  );
}
