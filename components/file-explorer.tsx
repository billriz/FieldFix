"use client";

import { useEffect, useMemo, useState } from "react";

import { FileCard, type FileCardData } from "@/components/file-card";
import { FolderRow, type FolderRowData } from "@/components/folder-row";
import { SearchBar } from "@/components/search-bar";
import { createClient } from "@/utils/supabase/client";

const allMachinesLabel = "All machines";
const allCategoriesLabel = "All categories";
const allFolderId = "all";
const uploadBucket = "technician-files";
const defaultMachineTypes = ["ATM", "TCR", "Drive-Up", "Cameras"];
const defaultCategories = ["Manuals", "Diagrams", "Forms", "Firmware"];

type FileRow = {
  id: string;
  filename: string;
  name: string | null;
  description: string | null;
  machine_type: string | null;
  model: string | null;
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
  const model = row.model?.trim();
  const category = row.category?.trim() || "Uncategorized";
  const tags = row.tags?.filter(Boolean) ?? [];

  return {
    id: row.id,
    folderId: toFolderId(machineType, category),
    name,
    description: row.description?.trim() || "No description provided.",
    machineType,
    model,
    category,
    fileType: formatFileType(row),
    size: formatSize(row.size_bytes),
    updatedAt: formatUpdatedAt(row.updated_at),
    updatedAtValue: new Date(row.updated_at).getTime(),
    folderUpdatedAt: formatFolderDate(row.updated_at),
    tags,
    searchText: [name, machineType, model, category, ...tags].filter(Boolean).join(" ").toLowerCase(),
  };
}

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanPathPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function cleanFilename(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "technician-file";
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

function FileListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex animate-pulse flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-slate-200" />
                <div className="h-6 w-20 rounded bg-slate-200" />
                <div className="h-6 w-12 rounded bg-slate-200" />
              </div>
              <div className="h-5 w-4/5 rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-4 w-20 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
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
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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
          "id,filename,name,description,machine_type,model,category,content_type,size_bytes,tags,updated_at",
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
  }, [activeCategory, activeMachine, refreshKey]);

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

  async function uploadFile(formData: FormData) {
    setIsUploading(true);
    setUploadMessage(null);
    setUploadErrorMessage(null);

    const file = formData.get("file");
    const machineType = cleanText(formData.get("machine_type"));
    const model = cleanText(formData.get("model"));
    const category = cleanText(formData.get("category"));
    const description = cleanText(formData.get("description"));

    if (!(file instanceof File) || file.size === 0) {
      setUploadErrorMessage("Choose a file to upload.");
      setIsUploading(false);
      return;
    }

    if (!machineType || !model || !category) {
      setUploadErrorMessage("Machine type, model, and category are required.");
      setIsUploading(false);
      return;
    }

    const supabase = createClient();
    const storagePath = [
      cleanPathPart(machineType),
      cleanPathPart(model),
      cleanPathPart(category),
      `${crypto.randomUUID()}-${cleanFilename(file.name)}`,
    ]
      .filter(Boolean)
      .join("/");

    const { error: uploadError } = await supabase.storage.from(uploadBucket).upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

    if (uploadError) {
      setUploadErrorMessage(uploadError.message || "File could not be uploaded.");
      setIsUploading(false);
      return;
    }

    const fileUrl = supabase.storage.from(uploadBucket).getPublicUrl(storagePath).data.publicUrl;
    const { error: insertError } = await supabase.from("files").insert({
      bucket: uploadBucket,
      path: storagePath,
      filename: file.name,
      name: file.name,
      description: description || null,
      machine_type: machineType,
      model,
      category,
      content_type: file.type || null,
      size_bytes: file.size,
      tags: [machineType, model, category],
      file_url: fileUrl,
    });

    if (insertError) {
      await supabase.storage.from(uploadBucket).remove([storagePath]);
      setUploadErrorMessage(insertError.message || "File record could not be saved.");
      setIsUploading(false);
      return;
    }

    setUploadMessage("File uploaded.");
    setActiveMachine(allMachinesLabel);
    setActiveCategory(allCategoriesLabel);
    setActiveFolderId(allFolderId);
    setRefreshKey((value) => value + 1);
    setIsUploading(false);
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              File Explorer
            </h1>
            <p className="text-sm leading-6 text-slate-600">
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

      <form
        action={uploadFile}
        className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Upload technician file</h2>
            <p className="mt-1 text-sm text-slate-600">Add a file with machine metadata.</p>
          </div>
          {uploadMessage ? <p className="text-sm font-medium text-emerald-700">{uploadMessage}</p> : null}
        </div>

        {uploadErrorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {uploadErrorMessage}
          </p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Machine type</span>
            <input
              name="machine_type"
              required
              placeholder="ATM"
              className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Model</span>
            <input
              name="model"
              required
              placeholder="NCR 6634"
              className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Category</span>
            <input
              name="category"
              required
              placeholder="Manuals"
              className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Description</span>
          <textarea
            name="description"
            rows={3}
            placeholder="Optional field notes"
            className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-950"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>File</span>
            <input
              name="file"
              type="file"
              required
              className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700"
            />
          </label>
          <button
            type="submit"
            disabled={isUploading}
            className="min-h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isUploading ? "Uploading..." : "Upload file"}
          </button>
        </div>
      </form>

        <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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

      <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-6">
        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">Folders</h2>
            <span className="text-sm text-slate-500">{folders.length}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:block lg:space-y-2">
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
            <FileListSkeleton />
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
