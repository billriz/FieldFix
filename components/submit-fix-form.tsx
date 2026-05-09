"use client";

import { FormEvent, useState } from "react";

const machineTypes = ["ATM", "TCR", "Drive-Up", "Cameras", "Alarm"];

type SubmitStatus =
  | {
      type: "success";
      message: string;
    }
  | {
      type: "error";
      message: string;
    }
  | null;

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
      {children}
    </label>
  );
}

const inputClassName =
  "min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200";

export function SubmitFixForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>(null);

  async function submitFix(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(form);
    const response = await fetch("/api/fixes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        machine_type: formData.get("machine_type"),
        manufacturer: formData.get("manufacturer"),
        model: formData.get("model"),
        error_code: formData.get("error_code"),
        title: formData.get("title"),
        symptoms: formData.get("symptoms"),
        fix_steps: splitLines(String(formData.get("fix_steps") ?? "")),
        parts_used: splitLines(String(formData.get("parts_used") ?? "")),
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | { id?: string; message?: string }
      | null;

    if (!response.ok) {
      setStatus({
        type: "error",
        message: result?.message ?? "Fix could not be submitted.",
      });
      setIsSubmitting(false);
      return;
    }

    form.reset();
    setStatus({
      type: "success",
      message: `Fix submitted for review${result?.id ? ` (${result.id})` : ""}.`,
    });
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={submitFix} className="space-y-6">
      <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="machine_type">Machine type</FieldLabel>
          <select id="machine_type" name="machine_type" required className={inputClassName}>
            <option value="">Select machine type</option>
            {machineTypes.map((machineType) => (
              <option key={machineType} value={machineType}>
                {machineType}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
          <input id="manufacturer" name="manufacturer" className={inputClassName} />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="model">Model</FieldLabel>
          <input id="model" name="model" className={inputClassName} />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="error_code">Error code</FieldLabel>
          <input id="error_code" name="error_code" className={inputClassName} />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <input id="title" name="title" required className={inputClassName} />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <FieldLabel htmlFor="symptoms">Symptoms</FieldLabel>
          <textarea
            id="symptoms"
            name="symptoms"
            required
            rows={4}
            className={`${inputClassName} py-3 leading-6`}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <FieldLabel htmlFor="fix_steps">Fix steps</FieldLabel>
          <textarea
            id="fix_steps"
            name="fix_steps"
            required
            rows={6}
            className={`${inputClassName} py-3 leading-6`}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <FieldLabel htmlFor="parts_used">Parts used</FieldLabel>
          <textarea
            id="parts_used"
            name="parts_used"
            rows={3}
            className={`${inputClassName} py-3 leading-6`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {status ? (
          <p
            className={[
              "text-sm font-medium",
              status.type === "success" ? "text-emerald-700" : "text-red-700",
            ].join(" ")}
          >
            {status.message}
          </p>
        ) : (
          <p className="text-sm text-slate-500">Submitted fixes are held for review.</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Submitting..." : "Submit fix"}
        </button>
      </div>
    </form>
  );
}
