type SearchBarProps = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({
  placeholder = "Search fixes, error codes, or equipment",
  value,
  onChange,
}: SearchBarProps) {
  return (
    <form role="search" className="w-full" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="fix-search" className="sr-only">
        Search fixes
      </label>
      <div className="flex min-h-13 items-center rounded-md border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-slate-500 focus-within:ring-4 focus-within:ring-slate-200 sm:min-h-14 sm:px-4">
        <span aria-hidden="true" className="mr-2 text-lg text-slate-500 sm:mr-3">
          &#8981;
        </span>
        <input
          id="fix-search"
          name="q"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-12 w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-500"
        />
      </div>
    </form>
  );
}
