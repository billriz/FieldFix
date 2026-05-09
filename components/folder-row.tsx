export type FolderRowData = {
  id: string;
  name: string;
  machineType: string;
  category: string;
  fileCount: number;
  updatedAt: string;
};

type FolderRowProps = {
  folder: FolderRowData;
  isActive?: boolean;
  onSelect: (folderId: string) => void;
};

export function FolderRow({ folder, isActive = false, onSelect }: FolderRowProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() => onSelect(folder.id)}
      className={[
        "grid w-full grid-cols-[1fr_auto] gap-3 rounded-md border p-3 text-left transition",
        isActive
          ? "border-slate-950 bg-slate-950 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-950 shadow-sm hover:border-slate-300 hover:shadow",
      ].join(" ")}
    >
      <span className="min-w-0 space-y-1">
        <span className="block truncate text-sm font-semibold">{folder.name}</span>
        <span className={["block text-xs", isActive ? "text-slate-200" : "text-slate-500"].join(" ")}>
          {folder.machineType} / {folder.category}
        </span>
      </span>
      <span className="text-right text-xs">
        <span className="block font-semibold">{folder.fileCount}</span>
        <span className={isActive ? "text-slate-200" : "text-slate-500"}>{folder.updatedAt}</span>
      </span>
    </button>
  );
}
