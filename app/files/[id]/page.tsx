/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";

import { FixCard, type FixCardData } from "@/components/fix-card";
import { createClient } from "@/utils/supabase/server";

type LinkedFix = {
  id: string;
  title: string;
  description: string | null;
  error_code: string | null;
  machine_type: string | null;
  model: string | null;
  updated_at: string;
};

type LinkedFixRow = {
  role: string | null;
  fixes: LinkedFix | LinkedFix[] | null;
};

type FileDetailRow = {
  id: string;
  bucket: string;
  path: string;
  filename: string;
  file_url: string | null;
  name: string | null;
  description: string | null;
  machine_type: string | null;
  model: string | null;
  category: string | null;
  content_type: string | null;
  size_bytes: number | null;
  tags: string[] | null;
  updated_at: string;
  fix_files: LinkedFixRow[] | null;
};

type FileDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatSize(sizeBytes: number | null) {
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
    year: "numeric",
  }).format(date)}`;
}

function toFixCard(row: LinkedFixRow): FixCardData | null {
  const fix = Array.isArray(row.fixes) ? row.fixes[0] : row.fixes;

  if (!fix) {
    return null;
  }

  return {
    id: fix.id,
    title: fix.title,
    description: fix.description ?? "No description provided.",
    equipment: fix.machine_type ?? fix.model ?? "Unspecified",
    errorCode: fix.error_code ?? undefined,
    updatedAt: formatUpdatedAt(fix.updated_at),
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

function FilePreview({
  name,
  previewUrl,
  contentType,
}: {
  name: string;
  previewUrl: string;
  contentType: string | null;
}) {
  const isImage = contentType?.startsWith("image/");
  const isPdf = contentType === "application/pdf" || name.toLowerCase().endsWith(".pdf");

  if (isImage) {
    return (
      <img
        src={previewUrl}
        alt={name}
        className="max-h-[640px] w-full rounded-md border border-slate-200 bg-white object-contain shadow-sm"
      />
    );
  }

  if (isPdf) {
    return (
      <iframe
        title={name}
        src={previewUrl}
        className="h-[640px] w-full rounded-md border border-slate-200 bg-white shadow-sm"
      />
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
      Preview is not available for this file type.
    </div>
  );
}

export default async function FileDetailPage({ params }: FileDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("files")
    .select(
      `
        id,
        bucket,
        path,
        filename,
        file_url,
        name,
        description,
        machine_type,
        model,
        category,
        content_type,
        size_bytes,
        tags,
        updated_at,
        fix_files (
          role,
          fixes (
            id,
            title,
            description,
            error_code,
            machine_type,
            model,
            updated_at
          )
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const file = data as unknown as FileDetailRow;
  const displayName = file.name?.trim() || file.filename;
  const tags = file.tags?.filter(Boolean) ?? [];
  const linkedFixes = (file.fix_files ?? [])
    .map((row) => toFixCard(row))
    .filter((fix): fix is FixCardData => Boolean(fix));
  const previewUrl = file.file_url ?? supabase.storage.from(file.bucket).getPublicUrl(file.path).data.publicUrl;

  return (
    <article className="space-y-6">
      <div className="space-y-3">
        <Link href="/files" className="text-sm font-medium text-slate-600 hover:text-slate-950">
          Back to files
        </Link>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            File detail
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-slate-950">
            {displayName}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            {file.description ?? "No description provided."}
          </p>
        </div>
      </div>

      <FilePreview name={displayName} previewUrl={previewUrl} contentType={file.content_type} />

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-950">Metadata</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <DetailField label="Machine type" value={file.machine_type ?? "Unspecified"} />
          <DetailField label="Model" value={file.model ?? "Unspecified"} />
          <DetailField label="Category" value={file.category ?? "Uncategorized"} />
          <DetailField label="File type" value={file.content_type ?? "Unknown"} />
          <DetailField label="Size" value={formatSize(file.size_bytes)} />
        </dl>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Storage path
              </dt>
              <dd className="mt-1 break-all text-sm font-medium text-slate-800">
                {file.bucket}/{file.path}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Updated
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {formatUpdatedAt(file.updated_at)}
              </dd>
            </div>
          </dl>

          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-950">Linked fixes</h2>
          <p className="text-sm text-slate-500">{linkedFixes.length} fixes</p>
        </div>

        {linkedFixes.length > 0 ? (
          <div className="space-y-3">
            {linkedFixes.map((fix) => (
              <FixCard key={fix.id} fix={fix} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            No fixes are linked to this file yet.
          </p>
        )}
      </section>
    </article>
  );
}
