// Deterministic, in-memory contact dataset. Same data every run (fixed seed),
// no network — so Profiler recordings are reproducible.

export type Contact = {
  id: number;
  name: string;
  email: string;
  company: string;
  status: "active" | "inactive";
  lastContacted: string; // ISO date
  phone: string;
};

// mulberry32 — a tiny, fast, deterministic PRNG.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Ava", "Liam", "Noah", "Emma", "Olivia", "Ethan", "Mia", "Lucas", "Sophia",
  "Mason", "Isabella", "Logan", "Amelia", "James", "Harper", "Aiden", "Ella",
  "Jack", "Grace", "Leo", "Chloe", "Ben", "Zoe", "Henry", "Lily", "Owen",
  "Nora", "Sam", "Ruby", "Max",
];
const LAST = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Lee",
  "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott", "Green",
  "Baker", "Adams", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner",
];
const COMPANIES = [
  "Acme Corp", "Globex", "Initech", "Umbrella", "Hooli", "Stark Industries",
  "Wayne Enterprises", "Soylent", "Vandelay", "Wonka Industries", "Cyberdyne",
  "Massive Dynamic", "Pied Piper", "Gringotts", "Tyrell Corp",
];

function generateContacts(count: number, seed: number): Contact[] {
  const rand = mulberry32(seed);
  const contacts: Contact[] = [];
  const base = Date.UTC(2026, 0, 1);

  for (let i = 0; i < count; i++) {
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    const company = COMPANIES[Math.floor(rand() * COMPANIES.length)];
    const daysAgo = Math.floor(rand() * 365);
    const status = rand() > 0.4 ? "active" : "inactive";
    const phoneDigits = Math.floor(rand() * 9_000_000) + 1_000_000;

    contacts.push({
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first}.${last}.${i + 1}`.toLowerCase() + "@example.com",
      company,
      status,
      lastContacted: new Date(base - daysAgo * 86_400_000).toISOString(),
      phone: `+1 (555) ${String(phoneDigits).slice(0, 3)}-${String(
        phoneDigits,
      ).slice(3, 7)}`,
    });
  }
  return contacts;
}

// ~5,000 contacts, generated once at module load with a fixed seed.
export const CONTACTS: Contact[] = generateContacts(5000, 1337);
