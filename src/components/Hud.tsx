import {
  comboMultiplier,
  manhattan,
  type Direction,
  type GameState,
  type LogEntry,
} from "@/lib/game";
import { cn } from "@/utils/cn";
import { formatScore, type ScoreEntry } from "@/lib/scores";
import {
  IconArrow,
  IconCrescent,
  IconEye,
  IconHourglass,
  IconShard,
  IconSparkle,
  IconStar,
  IconTrophy,
} from "./Icons";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/35 bg-[linear-gradient(150deg,#1b3d30,#0a1a14)] text-gold shadow-[0_0_22px_-8px_rgba(233,201,135,.65),inset_0_1px_0_rgba(255,255,255,.14)] sm:h-10 sm:w-10">
        <IconCrescent className="h-[19px] w-[19px] sm:h-5 sm:w-5" />
        <span className="absolute inset-[3px] rounded-full border border-gold/15" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-base font-semibold leading-none tracking-[0.22em] text-cream sm:text-lg">
          ЛУНОХОД
        </p>
        {!compact && (
          <p className="eyebrow mt-1 truncate text-[0.52rem] tracking-[0.2em] text-gold/60">
            настольная игра-побег
          </p>
        )}
      </div>
    </div>
  );
}

function plural(n: number, forms: [string, string, string]) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function ScoreBar({ game, best }: { game: GameState; best: number }) {
  const multiplier = comboMultiplier(game.shardsCollected);
  return (
    <div className="panel flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3.5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        <div className="min-w-0">
          <p className="eyebrow text-[0.5rem] text-gold/60 sm:text-[0.56rem]">Лунные очки</p>
          <p
            key={game.score}
            className="stat-bump mt-0.5 font-display text-[clamp(1.9rem,6vw,2.55rem)] font-semibold leading-none tabular-nums text-cream"
            aria-live="polite"
          >
            {formatScore(game.score)}
          </p>
        </div>
        <div className="hidden h-9 w-px bg-gold/15 sm:block" />
        <div className="hidden sm:block">
          <p className="eyebrow text-[0.56rem] text-gold/60">Рекорд</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold tabular-nums text-cream/85">
            <IconTrophy className="h-3.5 w-3.5 text-gold/70" />
            {formatScore(best)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="panel-inset flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5">
          <IconShard className="h-3.5 w-3.5 text-jade sm:h-4 sm:w-4" />
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold leading-none tabular-nums text-cream">
              {game.shardsCollected}
            </span>
            <span className="hidden text-[0.58rem] font-semibold uppercase tracking-wider text-cream/45 sm:inline">
              оск.
            </span>
          </div>
        </div>
        <div
          className={cn(
            "panel-inset flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5",
            multiplier > 1 && "border-gold/35 bg-gold/8"
          )}
        >
          <IconSparkle className="h-3.5 w-3.5 text-gold sm:h-4 sm:w-4" />
          <span className="text-sm font-extrabold leading-none tabular-nums text-gold">
            ×{multiplier}
          </span>
        </div>
        <div className="panel-inset hidden items-center gap-1.5 px-2.5 py-1.5 md:flex">
          <IconHourglass className="h-4 w-4 text-cream/50" />
          <span className="text-sm font-bold leading-none tabular-nums text-cream/75">
            {game.moves}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TensionPanel({ game }: { game: GameState }) {
  const distance = manhattan(game.player, game.shadow);
  const level = Math.max(0, 5 - Math.min(distance, 5));
  const word =
    distance <= 1
      ? "Вплотную"
      : distance === 2
        ? "Очень близко"
        : distance <= 4
          ? "Близко"
          : "Далеко";
  const multiplier = comboMultiplier(game.shardsCollected);
  const progress = multiplier >= 5 ? 100 : ((game.shardsCollected % 3) / 3) * 100;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#f0a99e]">
          <IconEye className="h-4 w-4" />
          <span className="eyebrow text-[0.58rem] text-[#e6a89c]">Тень</span>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider",
            distance <= 2
              ? "border-danger/35 bg-danger/10 text-[#ffb2a7] danger-glow"
              : "border-gold/15 bg-black/20 text-cream/60"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              distance <= 2 ? "bg-danger" : "bg-jade/70"
            )}
          />
          {word}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="font-display text-2xl leading-none text-cream">
            {distance} {plural(distance, ["плитка", "плитки", "плиток"])}
          </p>
          <p className="mt-1 text-[0.68rem] text-cream/45">до тени · шагов за ход: {game.shadowSpeed}</p>
        </div>
        <div className="flex items-end gap-1" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-all duration-300",
                i < level
                  ? distance <= 2
                    ? "bg-danger"
                    : "bg-gold/75"
                  : "bg-cream/10"
              )}
              style={{ height: 8 + i * 3 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-gold/10 pt-3">
        <div className="flex items-center justify-between text-[0.65rem]">
          <span className="font-semibold uppercase tracking-wider text-cream/45">
            Бонус за осколки
          </span>
          <span className="font-extrabold text-gold">
            ×{multiplier} {multiplier >= 5 && "· максимум"}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/35">
          <div
            className="h-full rounded-full bg-gradient-to-r from-jade-deep via-jade to-gold transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[0.68rem] leading-relaxed text-cream/40">
          Третий осколок подряд повышает множитель. Всего можно дойти до ×5.
        </p>
      </div>
    </div>
  );
}

export function Chronicle({ log, moves }: { log: LogEntry[]; moves: number }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md border border-gold/20 bg-black/25 text-gold/75">
            <IconStar className="h-3 w-3" />
          </span>
          <h3 className="font-display text-lg leading-none text-cream">Хроника стола</h3>
        </div>
        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-cream/35">
          ход {moves}
        </span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {log.slice(0, 5).map((entry, index) => (
          <li
            key={entry.id}
            className={cn(
              "log-entry flex gap-2.5 text-[0.76rem] leading-snug",
              index === 0 ? "text-cream/85" : "text-cream/45"
            )}
          >
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                entry.tone === "jade" && "bg-jade",
                entry.tone === "gold" && "bg-gold",
                entry.tone === "danger" && "bg-danger",
                entry.tone === "muted" && "bg-cream/30"
              )}
            />
            <span>{entry.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Leaderboard({
  scores,
  currentId,
  limit = 5,
  showDate = true,
}: {
  scores: ScoreEntry[];
  currentId?: string | null;
  limit?: number;
  showDate?: boolean;
}) {
  if (!scores.length) {
    return (
      <div className="rounded-xl border border-dashed border-gold/15 bg-black/15 px-4 py-6 text-center">
        <IconTrophy className="mx-auto h-5 w-5 text-gold/40" />
        <p className="mt-2 text-sm font-semibold text-cream/65">Рекордов пока нет</p>
        <p className="mt-1 text-[0.72rem] leading-relaxed text-cream/35">
          Первая партия впишет твоё имя в хронику.
        </p>
      </div>
    );
  }
  return (
    <ol className="space-y-1.5">
      {scores.slice(0, limit).map((entry, index) => {
        const isCurrent = entry.id === currentId;
        return (
          <li
            key={entry.id}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors",
              isCurrent
                ? "border-gold/45 bg-gold/10"
                : index === 0
                  ? "border-gold/20 bg-gold/[0.06]"
                  : "border-transparent bg-black/15"
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-md text-[0.66rem] font-extrabold tabular-nums",
                index === 0
                  ? "bg-gradient-to-b from-gold to-gold-deep text-[#241a08]"
                  : "border border-cream/10 bg-black/25 text-cream/55"
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-extrabold tabular-nums text-cream/90">
                  {formatScore(entry.score)}
                </span>
                <span className="shrink-0 text-[0.6rem] font-semibold text-cream/35">
                  {isCurrent ? "эта партия" : showDate ? formatDateSafe(entry.date) : ""}
                </span>
              </div>
              <p className="mt-0.5 text-[0.62rem] text-cream/35">
                {entry.shards} осколков · {entry.moves} шагов · ×{entry.multiplier}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatDateSafe(date: number) {
  try {
    return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" }).format(
      new Date(date)
    );
  } catch {
    return "";
  }
}

const ARROWS: { dir: Direction; rotate: string; label: string }[] = [
  { dir: "left", rotate: "-rotate-90", label: "Шаг влево" },
  { dir: "up", rotate: "rotate-0", label: "Шаг вверх" },
  { dir: "down", rotate: "rotate-180", label: "Шаг вниз" },
  { dir: "right", rotate: "rotate-90", label: "Шаг вправо" },
];

export function DPad({
  onMove,
  disabled,
}: {
  onMove: (dir: Direction) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid w-full grid-cols-4 gap-2 sm:w-auto">
      {ARROWS.map((arrow) => (
        <button
          key={arrow.dir}
          type="button"
          aria-label={arrow.label}
          disabled={disabled}
          onClick={() => onMove(arrow.dir)}
          className="dpad-btn group relative disabled:opacity-40"
        >
          <IconArrow
            className={cn(
              "h-4.5 w-4.5 text-gold/85 transition-transform duration-150 group-active:scale-90",
              arrow.rotate
            )}
          />
          <span className="absolute bottom-1 text-[0.5rem] font-bold uppercase tracking-widest text-cream/25">
            {arrow.dir === "left" ? "A" : arrow.dir === "up" ? "W" : arrow.dir === "down" ? "S" : "D"}
          </span>
        </button>
      ))}
    </div>
  );
}

export function GameStatsPills({ game }: { game: GameState }) {
  return (
    <div className="flex items-center justify-center gap-2 lg:hidden">
      <span className="rounded-full border border-gold/15 bg-black/20 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-cream/55">
        ход {game.moves}
      </span>
      <span className="flex items-center gap-1 rounded-full border border-jade/20 bg-jade/5 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-jade/80">
        <IconCrescent className="h-3 w-3" />
        {game.shardsCollected} оск.
      </span>
    </div>
  );
}
