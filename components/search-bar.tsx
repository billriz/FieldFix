type SearchBarProps = {
  placeholder?: string;
};

export function SearchBar({ placeholder = "Search fixes, error codes, or equipment" }: SearchBarProps) {
  return (
    <form role="search" className="w-full">
      <label htmlFor="fix-search" className="sr-only">
        Search fixes
      </label>
      <div className="flex min-h-14 items-center rounded-md border border-slate-300 bg-white px-4 shadow-sm focus-within:border-slate-500 focus-within:ring-4 focus-within:ring-slate-200">
        <span aria-hidden="true" className="mr-3 text-lg text-slate-500">
          &#8981;
        </span>
        <input
          id="fix-search"
          name="q"
          type="search"
          placeholder={placeholder}
          className="min-h-12 w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-500"
        />
      </div>
    </form>
  );
}
