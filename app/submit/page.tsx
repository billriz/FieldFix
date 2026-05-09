import { SubmitFixForm } from "@/components/submit-fix-form";

export default function SubmitPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-950">Submit Fix</h1>
        <p className="text-sm text-slate-600">
          Add a field-tested fix for review before it appears in search.
        </p>
      </div>

      <SubmitFixForm />
    </section>
  );
}
