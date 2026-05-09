"use client";

import { useEffect, useMemo, useState } from "react";

import { FileCard, type FileCardData } from "@/components/file-card";
import { FolderRow, type FolderRowData } from "@/components/folder-row";
import { SearchBar } from "@/components/search-bar";
import { createClient } from "@/utils/supabase/client";

const allMachinesLabel = "All machines";
const allCategoriesLabel = "All categories";
const allFolderId = "all";
const defaultMachineTypes = ["ATM", "TCR", "Drive-Up", "Cameras"];
const defaultCategories = ["Manuals", "Diagrams", "Forms", "Firmware"];

type FileRow = {
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

type ExplorerFile = FileCardData & {
  folderId: string;
  searchText: string;
  updatedAtValue: number;
  folderUpdatedAt: string;
};

function normalizeSearchTerm(value: string) {
  return value.trim().replace(/[(),]/g, " ").replace(/\s+/g, " ").toLowerCase().slice(0, 80);
}

function formatFileType(row: FileRow) {
  const extension = row.filename.split(".").pop();

  if (extension && extension !== row.filename) {
    return extension.toUpperCase();
  }

  if (row.content_type) {
    return row.content_type.split("/").pop()?.toUpperCase() ?? "FILE";
  }

  return "FILE";
}

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

  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  });

  return `${formatter.format(size)} ${units[unitIndex]}`;
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

function formatFolderDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function toFolderId(machineType: string, category: string) {
  return `${machineType}__${category}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function toExplorerFile(row: FileRow): ExplorerFile {
  const name = row.name?.trim() || row.filename;
  const machineType = row.machine_type?.trim() || "Unspecified";
  const category = row.category?.trim() || "Uncategorized";
  const tags = row.tags?.filter(Boolean) ?? [];

  return {
    id: row.id,
    folderId: toFolderId(machineType, category),
    name,
    description: row.description?.trim() || "No description provided.",
    machineType,
    category,
    fileType: formatFileType(row),
    size: formatSize(row.size_bytes),
    updatedAt: formatUpdatedAt(row.updated_at),
    updatedAtValue: new Date(row.updated_at).getTime(),
    folderUpdatedAt: formatFolderDate(row.updated_at),
    tags,
    searchText: [name, ...tags].join(" ").toLowerCase(),
  };
}

function Chip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={[
        "min-h-10 shrink-0 rounded-md border px-3 text-sm font-semibold transition-colors",
        isActive
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:text-slate-950",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function FileExplorer() {
  const [query, setQuery] = useState("");
  const [activeMachine, setActiveMachine] = useState(allMachinesLabel);
  const [activeCategory, setActiveCategory] = useState(allCategoriesLabel);
  const [activeFolderId, setActiveFolderId] = useState(allFolderId);
  const [files, setFiles] = useState<ExplorerFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchTerm = useMemo(() => normalizeSearchTerm(query), [query]);

  useEffect(() => {
    let isCurrent = true;

    async function fetchFiles() {
      setIsLoading(true);
      setErrorMessage(null);

      const supabase = createClient();
      let request = supabase
        .from("files")
        .select(
          "id,filename,name,description,machine_type,category,content_type,size_bytes,tags,updated_at",
        )
        .order("updated_at", { ascending: false });

      if (activeMachine !== allMachinesLabel) {
        request = request.eq("machine_type", activeMachine);
      }

      if (activeCategory !== allCategoriesLabel) {
        request = request.eq("category", activeCategory);
      }

      const { data, error } = await request;

      if (!isCurrent) {
        return;
      }

      if (error) {
        setFiles([]);
        setErrorMessage("Files could not be loaded. Please try again.");
      } else {
        setFiles((data ?? []).map((row) => toExplorerFile(row as FileRow)));
      }

      setIsLoading(false);
    }

    fetchFiles();

    return () => {
      isCurrent = false;
    };
  }, [activeCategory, activeMachine]);

  const machineTypes = useMemo(
    () => [
      allMachinesLabel,
      ...Array.from(new Set([...defaultMachineTypes, ...files.map((file) => file.machineType)])).sort((a, b) =>
        a.localeCompare(b),
      ),
    ],
    [files],
  );

  const categories = useMemo(
    () => [
      allCategoriesLabel,
      ...Array.from(new Set([...defaultCategories, ...files.map((file) => file.category)])).sort((a, b) =>
        a.localeCompare(b),
      ),
    ],
    [files],
  );

  const folders = useMemo<FolderRowData[]>(() => {
    const groupedFiles = new Map<
      string,
      {
        folder: FolderRowData;
        updatedAtValue: number;
      }
    >();

    for (const file of files) {
      const existing = groupedFiles.get(file.folderId);

      if (existing) {
        existing.folder.fileCount += 1;

        if (!Number.isNaN(file.updatedAtValue) && file.updatedAtValue > existing.updatedAtValue) {
          existing.updatedAtValue = file.updatedAtValue;
          existing.folder.updatedAt = file.folderUpdatedAt;
        }

        continue;
      }

      groupedFiles.set(file.folderId, {
        folder: {
          id: file.folderId,
          name: `${file.machineType} ${file.category}`.trim(),
          machineType: file.machineType,
          category: file.category,
          fileCount: 1,
          updatedAt: file.folderUpdatedAt,
        },
        updatedAtValue: Number.isNaN(file.updatedAtValue) ? 0 : file.updatedAtValue,
      });
    }

    return [
      {
        id: allFolderId,
        name: "All field files",
        machineType: "Mixed",
        category: "Library",
        fileCount: files.length,
        updatedAt: files[0]?.folderUpdatedAt ?? "Recent",
      },
      ...Array.from(groupedFiles.values())
        .sort((a, b) => a.folder.name.localeCompare(b.folder.name))
        .map(({ folder }) => folder),
    ];
  }, [files]);

  const visibleFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesFolder = activeFolderId === allFolderId || file.folderId === activeFolderId;
      const matchesQuery = !searchTerm || file.searchText.includes(searchTerm);

      return matchesFolder && matchesQuery;
    });
  }, [activeFolderId, files, searchTerm]);

  function selectMachine(machineType: string) {
    setActiveMachine(machineType);
    setActiveFolderId(allFolderId);
  }

  function selectCategory(category: string) {
    setActiveCategory(category);
    setActiveFolderId(allFolderId);
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">File Explorer</h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse field files by folder, machine type, category, or keyword.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">{visibleFiles.length} files</p>
        </div>

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search file names or tags"
        />
      </div>

      {errorMessage ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}

      <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            Machine type
          </p>
          <div aria-label="Machine type filters" className="flex gap-2 overflow-x-auto pb-1">
            {machineTypes.map((machineType) => (
              <Chip
                key={machineType}
                label={machineType}
                isActive={machineType === activeMachine}
                onClick={() => selectMachine(machineType)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Category</p>
          <div aria-label="Category filters" className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                isActive={category === activeCategory}
                onClick={() => selectCategory(category)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">Folders</h2>
            <span className="text-sm text-slate-500">{folders.length}</span>
          </div>
          <div className="space-y-2">
            {folders.map((folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                isActive={folder.id === activeFolderId}
                onSelect={setActiveFolderId}
              />
            ))}
          </div>
        </aside>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-slate-950">Files</h2>
            <p className="text-sm text-slate-500">
              {activeFolderId === "all"
                ? "All folders"
                : folders.find((folder) => folder.id === activeFolderId)?.name}
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              Loading files...
            </div>
          ) : visibleFiles.length > 0 ? (
            <div className="space-y-3">
              {visibleFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              No files match the current search and filters.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
