type FilterChipsProps = {
  filters: string[];
  activeFilter?: string;
};

export function FilterChips({ filters, activeFilter }: FilterChipsProps) {
  return (
    <div aria-label="Fix filters" className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => {
        const isActive = filter === activeFilter;

        return (
          <button
            key={filter}
            type="button"
            aria-pressed={isActive}
            className={[
              "min-h-11 shrink-0 rounded-md border px-4 text-sm font-semibold transition-colors",
              isActive
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:text-slate-950",
            ].join(" ")}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
