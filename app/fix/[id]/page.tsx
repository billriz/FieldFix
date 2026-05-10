import Link from "next/link";
import { notFound } from "next/navigation";

import { FileCard, type FileCardData } from "@/components/file-card";
import { FixFeedback } from "@/components/fix-feedback";
import { createClient } from "@/utils/supabase/server";

type LinkedFile = {
  id: string;
  filename: string;
  name: string | null;
  description: string | null;
  machine_type: string | null;
  category: string | null;
  content_type: string | null;
  size_bytes: number | null;
  tags: string[] | null;
  updated_at: string;
};

type LinkedFileRow = {
  role: string | null;
  files: LinkedFile | LinkedFile[] | null;
};

type FixDetailRow = {
  id: string;
  title: string;
  description: string | null;
  machine_type: string | null;
  manufacturer: string | null;
  model: string | null;
  symptoms: string | null;
  fix_steps: string[] | null;
  parts_used: string[] | null;
  failure_count: number | null;
  success_count: number | null;
  fix_files: LinkedFileRow[] | null;
};

type FixDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function cleanList(values: string[] | null | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function inferSteps(description: string | null) {
  if (!description) {
    return [];
  }

  return description
    .replace(/\s+before\s+/i, ". Before ")
    .split(/,\s*(?:then\s+|and\s+)?|\.\s+/)
    .map((step) => step.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function formatFileType(file: LinkedFile) {
  const extension = file.filename.split(".").pop();

  if (extension && extension !== file.filename) {
    return extension.toUpperCase();
  }

  if (file.content_type) {
    return file.content_type.split("/").pop()?.toUpperCase() ?? "FILE";
  }

  return "FILE";
}

function formatFileSize(sizeBytes: number | null) {
  if (!sizeBytes) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = sizeBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${new Intl.NumberFormat("en", {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  }).format(size)} ${units[unitIndex]}`;
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  return `Updated ${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date)}`;
}

function toFileCard(row: LinkedFileRow): FileCardData | null {
  const file = Array.isArray(row.files) ? row.files[0] : row.files;

  if (!file) {
    return null;
  }

  return {
    id: file.id,
    name: file.name?.trim() || file.filename,
    description: file.description?.trim() || "No description provided.",
    machineType: file.machine_type ?? "Unspecified",
    category: file.category ?? "Uncategorized",
    fileType: formatFileType(file),
    size: formatFileSize(file.size_bytes),
    updatedAt: formatUpdatedAt(file.updated_at),
    tags: file.tags?.filter(Boolean) ?? [],
  };
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

export default async function FixDetailPage({ params }: FixDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fixes")
    .select(
      `
        id,
        title,
        description,
        machine_type,
        manufacturer,
        model,
        symptoms,
        fix_steps,
        parts_used,
        success_count,
        failure_count,
        fix_files (
          role,
          files (
            id,
            filename,
            name,
            description,
            machine_type,
            category,
            content_type,
            size_bytes,
            tags,
            updated_at
          )
        )
      `,
    )
    .eq("id", id)
    .eq("approved", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const fix = data as unknown as FixDetailRow;
  const steps = cleanList(fix.fix_steps);
  const readableSteps = steps.length > 0 ? steps : inferSteps(fix.description);
  const parts = cleanList(fix.parts_used);
  const relatedFiles = (fix.fix_files ?? [])
    .map((row) => toFileCard(row))
    .filter((file): file is FileCardData => Boolean(file));

  return (
    <article className="space-y-6">
      <div className="space-y-3">
        <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-slate-950">
          Back to search
        </Link>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Fix detail</p>
          <h1 className="max-w-3xl text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            {fix.title}
          </h1>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <DetailField label="Machine type" value={fix.machine_type ?? fix.model ?? "Unspecified"} />
        <DetailField label="Manufacturer" value={fix.manufacturer ?? "Unspecified"} />
        <DetailField label="Model" value={fix.model ?? "Unspecified"} />
      </dl>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-950">Symptoms</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {fix.symptoms ?? fix.description ?? "No symptoms documented."}
        </p>
      </section>

      <section className="rounded-md border border-slate-300 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950">Fix steps</h2>
          <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {readableSteps.length} steps
          </span>
        </div>

        {readableSteps.length > 0 ? (
          <ol className="mt-5 space-y-4">
            {readableSteps.map((step, index) => (
              <li key={`${step}-${index}`} className="flex gap-3 sm:gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-950 text-sm font-semibold text-white sm:h-9 sm:w-9">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-slate-800 sm:pt-1.5 sm:text-base sm:leading-7">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-600">No fix steps documented.</p>
        )}
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-950">Parts used</h2>
        {parts.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {parts.map((part) => (
              <li
                key={part}
                className="rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                {part}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">No parts recorded.</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-950">Related Files</h2>
          <p className="text-sm text-slate-500">{relatedFiles.length} files</p>
        </div>

        {relatedFiles.length > 0 ? (
          <div className="space-y-3">
            {relatedFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            No files are linked to this fix yet.
          </p>
        )}
      </section>

      <FixFeedback
        fixId={fix.id}
        initialFailureCount={fix.failure_count ?? 0}
        initialSuccessCount={fix.success_count ?? 0}
      />
    </article>
  );
}
