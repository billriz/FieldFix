import { FilterChips } from "@/components/filter-chips";
import { SearchResults } from "@/components/search-results";

const filters = ["ATM", "TCR", "Drive-Up", "Cameras", "Alarm"];

export default function SearchPage() {
  return (
    <section className="space-y-6">
      <SearchResults filters={<FilterChips filters={filters} activeFilter="ATM" />} />
    </section>
  );
}
