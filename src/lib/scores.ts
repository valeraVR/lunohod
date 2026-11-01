export interface ScoreEntry {
  id: string;
  score: number;
  shards: number;
  moves: number;
  multiplier: number;
  date: number;
}

const STORAGE_KEY = "lunohod.highscores.v1";
const MAX_SCORES = 8;

function isEntry(value: unknown): value is ScoreEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.score === "number" &&
    Number.isFinite(entry.score) &&
    typeof entry.shards === "number" &&
    typeof entry.moves === "number" &&
    typeof entry.date === "number"
  );
}

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isEntry)
      .map((entry) => ({
        ...entry,
        id: entry.id ?? `${entry.date}-${entry.score}`,
        multiplier: entry.multiplier ?? 1,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES);
  } catch {
    return [];
  }
}

export interface RunResult {
  score: number;
  shards: number;
  moves: number;
  multiplier: number;
}

export function submitScore(run: RunResult): {
  scores: ScoreEntry[];
  entry: ScoreEntry;
  rank: number | null;
} {
  const entry: ScoreEntry = {
    ...run,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: Date.now(),
  };
  const scores = [...loadScores(), entry].sort((a, b) => b.score - a.score);
  const index = scores.findIndex((item) => item.id === entry.id);
  const rank = index < MAX_SCORES ? index + 1 : null;
  const kept = scores.slice(0, MAX_SCORES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
  } catch {
    /* storage can be unavailable — the game still works */
  }
  return { scores: kept, entry, rank };
}

export function clearScores(): ScoreEntry[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return [];
}

export function formatScore(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.max(0, Math.round(value)));
}

export function formatDate(value: number): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}
