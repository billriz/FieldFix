export type FileCardData = {
  id: string;
  name: string;
  description: string;
  machineType: string;
  category: string;
  fileType: string;
  size: string;
  updatedAt: string;
};

type FileCardProps = {
  file: FileCardData;
};

export function FileCard({ file }: FileCardProps) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {file.machineType}
            </span>
            <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-900">
              {file.category}
            </span>
            <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
              {file.fileType}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="truncate text-lg font-semibold text-slate-950">{file.name}</h2>
            <p className="text-sm leading-6 text-slate-600">{file.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-6 text-sm text-slate-500 sm:block sm:space-y-2 sm:text-right">
          <p className="font-medium text-slate-700">{file.size}</p>
          <p>{file.updatedAt}</p>
        </div>
      </div>
    </article>
  );
}
