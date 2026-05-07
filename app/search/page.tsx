import { FilterChips } from "@/components/filter-chips";
import { FixCard, type FixCardData } from "@/components/fix-card";
import { SearchBar } from "@/components/search-bar";

const filters = ["ATM", "TCR", "Drive-Up", "Cameras", "Alarm"];

const mockFixes: FixCardData[] = [
  {
    id: "atm-receipt-jam",
    title: "Receipt printer jam after cash withdrawal",
    description:
      "Clear paper from the cutter path, reseat the roll, and run a receipt test from supervisor mode before returning the ATM to service.",
    equipment: "ATM",
    errorCode: "E-204",
    updatedAt: "Updated today",
  },
  {
    id: "tcr-cassette-mismatch",
    title: "TCR cassette count mismatch",
    description:
      "Confirm cassette position, inspect the feed rollers for debris, then complete a reconciliation cycle with dual control present.",
    equipment: "TCR",
    errorCode: "C-118",
    updatedAt: "Updated yesterday",
  },
  {
    id: "drive-up-audio",
    title: "Drive-up lane audio is one-way only",
    description:
      "Check teller station mute state, reseat the lane audio connector, and verify the microphone level at the customer unit.",
    equipment: "Drive-Up",
    updatedAt: "Updated May 3",
  },
];

export default function SearchPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-950">Search fixes</h1>
        <SearchBar />
      </div>

      <FilterChips filters={filters} activeFilter="ATM" />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-950">Results</h2>
          <p className="text-sm text-slate-500">{mockFixes.length} fixes</p>
        </div>

        <div className="space-y-3">
          {mockFixes.map((fix) => (
            <FixCard key={fix.id} fix={fix} />
          ))}
        </div>
      </div>
    </section>
  );
}
