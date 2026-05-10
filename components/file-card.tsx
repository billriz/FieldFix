import Link from "next/link";

export type FileCardData = {
  id: string;
  name: string;
  description: string;
  machineType: string;
  model?: string;
  category: string;
  fileType: string;
  size: string;
  updatedAt: string;
  tags?: string[];
};

type FileCardProps = {
  file: FileCardData;
};

export function FileCard({ file }: FileCardProps) {
  return (
    <Link
      href={`/files/${file.id}`}
      className="block rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {file.machineType}
            </span>
            {file.model ? (
              <span className="rounded bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                {file.model}
              </span>
            ) : null}
            <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-900">
              {file.category}
            </span>
            <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
              {file.fileType}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="truncate text-lg font-semibold leading-6 text-slate-950">{file.name}</h2>
            <p className="line-clamp-3 text-sm leading-6 text-slate-600">{file.description}</p>
          </div>

          {file.tags && file.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {file.tags.map((tag) => (
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

        <div className="flex shrink-0 items-center justify-between gap-6 text-sm text-slate-500 sm:block sm:space-y-2 sm:text-right">
          <p className="font-medium text-slate-700">{file.size}</p>
          <p>{file.updatedAt}</p>
        </div>
      </div>
    </Link>
  );
}
