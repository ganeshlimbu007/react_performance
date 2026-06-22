"use client";

export type StatusFilter = "all" | "active" | "inactive";

export function Filters({
  search,
  onSearch,
  status,
  onStatus,
  company,
  onCompany,
  companies,
}: {
  search: string;
  onSearch: (v: string) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  company: string;
  onCompany: (v: string) => void;
  companies: string[];
}) {
  return (
    <section className="rl-filters">
      <input
        className="rl-input"
        placeholder="Search name, email, company…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        className="rl-select"
        value={status}
        onChange={(e) => onStatus(e.target.value as StatusFilter)}
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select
        className="rl-select"
        value={company}
        onChange={(e) => onCompany(e.target.value)}
      >
        <option value="all">All companies</option>
        {companies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </section>
  );
}
