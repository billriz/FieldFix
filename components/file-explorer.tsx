"use client";

import { useMemo, useState } from "react";

import { FileCard, type FileCardData } from "@/components/file-card";
import { FolderRow, type FolderRowData } from "@/components/folder-row";
import { SearchBar } from "@/components/search-bar";

const machineTypes = ["All machines", "ATM", "TCR", "Drive-Up", "Cameras"];
const categories = ["All categories", "Manuals", "Diagrams", "Forms", "Firmware"];

const folders: FolderRowData[] = [
  {
    id: "all",
    name: "All field files",
    machineType: "Mixed",
    category: "Library",
    fileCount: 8,
    updatedAt: "Today",
  },
  {
    id: "atm-service",
    name: "ATM service",
    machineType: "ATM",
    category: "Manuals",
    fileCount: 3,
    updatedAt: "May 7",
  },
  {
    id: "tcr-calibration",
    name: "TCR calibration",
    machineType: "TCR",
    category: "Diagrams",
    fileCount: 2,
    updatedAt: "May 5",
  },
  {
    id: "branch-security",
    name: "Branch security",
    machineType: "Cameras",
    category: "Forms",
    fileCount: 3,
    updatedAt: "May 3",
  },
];

const files: Array<FileCardData & { folderId: string }> = [
  {
    id: "file-001",
    folderId: "atm-service",
    name: "NCR 6634 dispenser recovery checklist.pdf",
    description: "Step-by-step field checklist for safe dispenser recovery after presenter jams.",
    machineType: "ATM",
    category: "Manuals",
    fileType: "PDF",
    size: "1.8 MB",
    updatedAt: "Updated May 7",
  },
  {
    id: "file-002",
    folderId: "atm-service",
    name: "Hyosung MX5200 receipt printer quick guide.pdf",
    description: "Common receipt printer symptoms, reset sequence, and part verification notes.",
    machineType: "ATM",
    category: "Manuals",
    fileType: "PDF",
    size: "940 KB",
    updatedAt: "Updated May 6",
  },
  {
    id: "file-003",
    folderId: "atm-service",
    name: "ATM cash cassette inspection form.xlsx",
    description: "Reusable inspection form for cassette fit, latch condition, and denomination setup.",
    machineType: "ATM",
    category: "Forms",
    fileType: "XLSX",
    size: "320 KB",
    updatedAt: "Updated May 2",
  },
  {
    id: "file-004",
    folderId: "tcr-calibration",
    name: "Glory RBG-100 sensor map.png",
    description: "Annotated sensor map for transport faults and reject path troubleshooting.",
    machineType: "TCR",
    category: "Diagrams",
    fileType: "PNG",
    size: "2.3 MB",
    updatedAt: "Updated May 5",
  },
  {
    id: "file-005",
    folderId: "tcr-calibration",
    name: "TCR calibration sign-off.pdf",
    description: "Branch sign-off packet for calibration completion and variance notes.",
    machineType: "TCR",
    category: "Forms",
    fileType: "PDF",
    size: "680 KB",
    updatedAt: "Updated May 4",
  },
  {
    id: "file-006",
    folderId: "branch-security",
    name: "Drive-up camera alignment reference.jpg",
    description: "Reference captures for field of view, glare checks, and lane coverage.",
    machineType: "Drive-Up",
    category: "Diagrams",
    fileType: "JPG",
    size: "4.1 MB",
    updatedAt: "Updated May 3",
  },
  {
    id: "file-007",
    folderId: "branch-security",
    name: "DVR firmware release notes.txt",
    description: "Current branch DVR firmware notes, known issues, and rollback guidance.",
    machineType: "Cameras",
    category: "Firmware",
    fileType: "TXT",
    size: "84 KB",
    updatedAt: "Updated Apr 29",
  },
  {
    id: "file-008",
    folderId: "branch-security",
    name: "Alarm panel service authorization.pdf",
    description: "Authorization form for service windows, testing contacts, and monitoring bypass.",
    machineType: "Cameras",
    category: "Forms",
    fileType: "PDF",
    size: "510 KB",
    updatedAt: "Updated Apr 28",
  },
];

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
  const [activeMachine, setActiveMachine] = useState(machineTypes[0]);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [activeFolderId, setActiveFolderId] = useState("all");

  const visibleFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return files.filter((file) => {
      const matchesFolder = activeFolderId === "all" || file.folderId === activeFolderId;
      const matchesMachine = activeMachine === "All machines" || file.machineType === activeMachine;
      const matchesCategory = activeCategory === "All categories" || file.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        [file.name, file.description, file.machineType, file.category, file.fileType]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFolder && matchesMachine && matchesCategory && matchesQuery;
    });
  }, [activeCategory, activeFolderId, activeMachine, query]);

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
          placeholder="Search files, folders, machine types, or categories"
        />
      </div>

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
                onClick={() => setActiveMachine(machineType)}
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
                onClick={() => setActiveCategory(category)}
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

          {visibleFiles.length > 0 ? (
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
