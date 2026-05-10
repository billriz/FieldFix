"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";

import { FixCard, type FixCardData } from "@/components/fix-card";
import { SearchBar } from "@/components/search-bar";
import { createClient } from "@/utils/supabase/client";

type FixRow = {
  id: string;
  title: string;
  description: string | null;
  error_code: string | null;
  model: string | null;
  updated_at: string;
};

const resultLimit = 20;

function normalizeSearchTerm(value: string) {
  return value.trim().replace(/[(),]/g, " ").replace(/\s+/g, " ").slice(0, 80);
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

function toFixCard(row: FixRow): FixCardData {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "No description provided.",
    equipment: row.model ?? "Unspecified model",
    errorCode: row.error_code ?? undefined,
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

type SearchResultsProps = {
  filters?: ReactNode;
};

function ResultSkeleton() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex animate-pulse flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded bg-slate-200" />
            <div className="h-6 w-14 rounded bg-slate-200" />
          </div>
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-4 w-24 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function SearchResults({ filters }: SearchResultsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FixCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchTerm = useMemo(() => normalizeSearchTerm(query), [query]);

  useEffect(() => {
    let isCurrent = true;

    const timeout = window.setTimeout(async () => {
      if (!searchTerm) {
        setResults([]);
        setErrorMessage(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const pattern = `%${searchTerm}%`;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("fixes")
        .select("id,title,description,error_code,model,updated_at")
        .eq("approved", true)
        .or(`title.ilike.${pattern},error_code.ilike.${pattern},model.ilike.${pattern}`)
        .order("updated_at", { ascending: false })
        .limit(resultLimit);

      if (!isCurrent) {
        return;
      }

      if (error) {
        setResults([]);
        setErrorMessage("Search failed. Please try again.");
      } else {
        setResults((data ?? []).map((row) => toFixCard(row as FixRow)));
      }

      setIsLoading(false);
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [searchTerm]);

  return (
    <>
      <div className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            Search fixes
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Find approved field fixes by equipment, model, or error code.
          </p>
        </div>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {filters}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-950">Results</h2>
          <p className="shrink-0 text-sm text-slate-500">
            {isLoading ? "Searching" : `${results.length} fixes`}
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {!searchTerm && !errorMessage ? (
          <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Type a title, error code, or model to search approved fixes.
          </p>
        ) : null}

        {searchTerm && !isLoading && !errorMessage && results.length === 0 ? (
          <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            No approved fixes found.
          </p>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            <ResultSkeleton />
            <ResultSkeleton />
            <ResultSkeleton />
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((fix) => (
              <FixCard key={fix.id} fix={fix} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
