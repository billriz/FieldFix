import Link from "next/link";

export type FixCardData = {
  id: string;
  title: string;
  description: string;
  equipment: string;
  errorCode?: string;
  updatedAt: string;
};

type FixCardProps = {
  fix: FixCardData;
};

export function FixCard({ fix }: FixCardProps) {
  return (
    <Link
      href={`/fix/${fix.id}`}
      className="block rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {fix.equipment}
            </span>
            {fix.errorCode ? (
              <span className="rounded bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                {fix.errorCode}
              </span>
            ) : null}
          </div>
          <h2 className="text-lg font-semibold leading-6 text-slate-950">{fix.title}</h2>
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">{fix.description}</p>
        </div>
        <p className="shrink-0 text-sm font-medium text-slate-500 sm:pt-1 sm:text-right">
          {fix.updatedAt}
        </p>
      </div>
    </Link>
  );
}
