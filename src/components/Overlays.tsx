import type { ReactNode } from "react";
import {
  comboMultiplier,
  causeCopy,
  type GameState,
} from "@/lib/game";
import { formatScore, type ScoreEntry } from "@/lib/scores";
import { cn } from "@/utils/cn";
import {
  IconBook,
  IconClose,
  IconCrescent,
  IconHome,
  IconHourglass,
  IconMuted,
  IconPause,
  IconPlay,
  IconRestart,
  IconShard,
  IconSparkle,
  IconSound,
  IconStar,
  IconTrophy,
  Ornament,
} from "./Icons";

function OverlayFrame({
  children,
  labelledBy,
  closeOnBackdrop,
  onBackdrop,
  wide,
}: {
  children: ReactNode;
  labelledBy: string;
  closeOnBackdrop?: boolean;
  onBackdrop?: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="overlay fixed inset-0 z-[80] flex items-end justify-center bg-[#030b08]/80 p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onBackdrop?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "modal-card panel relative max-h-[94dvh] w-full overflow-y-auto rounded-t-[26px] border-gold/20 p-5 shadow-[0_-30px_80px_-20px_rgba(0,0,0,.9)] sm:rounded-[24px] sm:p-7",
          wide ? "max-w-2xl" : "max-w-[480px]"
        )}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        {children}
      </div>
    </div>
  );
}

export function PauseOverlay({
  game,
  best,
  muted,
  onResume,
  onRestart,
  onMenu,
  onRules,
  onToggleSound,
}: {
  game: GameState;
  best: number;
  muted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onRules: () => void;
  onToggleSound: () => void;
}) {
  return (
    <OverlayFrame labelledBy="pause-title">
      <div className="flex flex-col items-center text-center">
        <span className="relative grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-[radial-gradient(circle_at_35%_25%,#20493a,#081712)] text-gold shadow-[0_0_30px_-10px_rgba(233,201,135,.7)]">
          <IconPause className="h-5 w-5" />
          <span className="absolute inset-[4px] rounded-full border border-gold/10" />
        </span>
        <p className="eyebrow mt-4 text-[0.58rem] text-gold/60">партия на паузе</p>
        <h2 id="pause-title" className="mt-1.5 font-display text-4xl leading-none text-cream">
          Стол ждёт
        </h2>
        <p className="mt-2 max-w-xs text-[0.8rem] leading-relaxed text-cream/45">
          Свеча не погасла. Тень тоже замерла — но ненадолго.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <PauseStat label="Очки" value={formatScore(game.score)} />
        <PauseStat label="Осколки" value={String(game.shardsCollected)} icon={<IconShard className="h-3 w-3" />} />
        <PauseStat label="Рекорд" value={formatScore(best)} icon={<IconTrophy className="h-3 w-3" />} />
      </div>

      <div className="mt-5 space-y-2">
        <button type="button" className="btn btn-gold w-full" onClick={onResume}>
          <IconPlay className="h-4 w-4" />
          Продолжить партию
          <span className="ml-auto hidden rounded border border-[#24180a]/20 px-1.5 py-0.5 text-[0.56rem] font-extrabold tracking-wider sm:inline-flex">
            ESC
          </span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-quiet" onClick={onRestart}>
            <IconRestart className="h-4 w-4 text-gold/80" />
            Заново
          </button>
          <button type="button" className="btn btn-quiet" onClick={onMenu}>
            <IconHome className="h-4 w-4 text-gold/80" />
            В меню
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gold/10 pt-3">
        <button
          type="button"
          className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-cream/45 transition-colors hover:text-cream/80"
          onClick={onRules}
        >
          <IconBook className="h-3.5 w-3.5" /> Правила
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-cream/45 transition-colors hover:text-cream/80"
          onClick={onToggleSound}
        >
          {muted ? <IconMuted className="h-3.5 w-3.5" /> : <IconSound className="h-3.5 w-3.5" />}
          Звук: {muted ? "выкл" : "вкл"}
        </button>
      </div>
    </OverlayFrame>
  );
}

function PauseStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="panel-inset px-2 py-2.5 text-center">
      <p className="flex items-center justify-center gap-1 text-[0.52rem] font-bold uppercase tracking-wider text-cream/35">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-xl leading-none tabular-nums text-cream">{value}</p>
    </div>
  );
}

export function RulesModal({
  onClose,
  primaryLabel,
  onPrimary,
}: {
  onClose: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
}) {
  return (
    <OverlayFrame labelledBy="rules-title" closeOnBackdrop onBackdrop={onClose} wide>
      <button
        type="button"
        className="icon-btn absolute right-3 top-3 h-9 w-9"
        aria-label="Закрыть правила"
        onClick={onClose}
      >
        <IconClose className="h-4 w-4" />
      </button>

      <div className="pr-10">
        <p className="eyebrow text-[0.56rem] text-gold/60">свод правил · стол №7</p>
        <h2 id="rules-title" className="mt-1 font-display text-4xl leading-none text-cream">
          Как играть
        </h2>
        <p className="mt-2 max-w-lg text-[0.82rem] leading-relaxed text-cream/45">
          Каждый твой шаг — ход. Ты ведёшь лунный жетон по соседним плиткам, собираешь
          осколки и уходишь от Тени. Плитки за спиной трескаются и падают в пустоту.
        </p>
      </div>

      <div className="ornament-line my-4 text-gold/45">
        <IconStar className="h-2.5 w-2.5" />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <RuleItem
          index="01"
          icon={<IconPlay className="h-4 w-4" />}
          title="Один шаг за ход"
          text="Стрелки, WASD, свайп по столу или касание соседней плитки. На мобильном под столом есть кнопки направления."
        />
        <RuleItem
          index="02"
          icon={<IconShard className="h-4 w-4" />}
          title="Собирай осколки"
          text="Каждый осколок — 100 очков, умноженные на твой бонус. Третий осколок подряд повышает множитель до ×5."
        />
        <RuleItem
          index="03"
          icon={<IconStar className="h-4 w-4" />}
          title="Звёздный ключ"
          text="Появляется после каждого второго осколка. Даёт 400 очков и изгоняет Тень в дальний угол стола."
        />
        <RuleItem
          index="04"
          icon={<IconEyeMini />}
          title="Тень идёт следом"
          text="После твоего шага она делает свой. Не вставай к ней вплотную: касание заканчивает партию. Каждые двадцать шагов Тень ускоряется — вечно не простоять."
        />
        <RuleItem
          index="05"
          icon={<IconHourglass className="h-4 w-4" />}
          title="Стол осыпается"
          text="Плитка, которую ты покинул, рушится через два хода. Можно вернуться на треснувшую плитку — это восстановит её."
        />
        <RuleItem
          index="06"
          icon={<IconTrophy className="h-4 w-4" />}
          title="Финал и рекорды"
          text="Партия кончается, когда Тень коснулась тебя или не осталось ни одного пути. Рекорды сохраняются на этом устройстве."
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl border border-gold/12 bg-black/25 px-4 py-3 text-[0.7rem] font-semibold text-cream/55">
        <span className="flex items-center gap-1.5 text-jade/85">
          <IconSparkle className="h-3.5 w-3.5" /> шаг +10
        </span>
        <span className="h-3 w-px bg-gold/15" />
        <span className="flex items-center gap-1.5">
          <IconShard className="h-3.5 w-3.5 text-jade" /> осколок +100 × бонус
        </span>
        <span className="h-3 w-px bg-gold/15" />
        <span className="flex items-center gap-1.5 text-gold/85">
          <IconStar className="h-3.5 w-3.5" /> ключ +400
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.68rem] text-cream/35">
          <span className="keycap mr-1.5">P</span> или <span className="keycap mx-1.5">ESC</span> —
          пауза в любой момент. Осколок ослепляет Тень и даёт тебе передышку.
        </p>
        <button
          type="button"
          className="btn btn-gold shrink-0 whitespace-nowrap"
          onClick={onPrimary ?? onClose}
        >
          <IconPlay className="h-4 w-4" />
          {primaryLabel ?? "Вернуться к столу"}
        </button>
      </div>
    </OverlayFrame>
  );
}

function IconEyeMini() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function RuleItem({
  index,
  icon,
  title,
  text,
}: {
  index: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gold/10 bg-[linear-gradient(155deg,rgba(29,64,51,.5),rgba(6,18,13,.5))] p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md border border-gold/20 bg-black/25 text-gold/80">
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
          <h3 className="text-[0.82rem] font-extrabold text-cream/90">{title}</h3>
          <span className="font-display text-xs italic text-gold/35">{index}</span>
        </div>
      </div>
      <p className="mt-2 text-[0.73rem] leading-relaxed text-cream/45">{text}</p>
    </div>
  );
}

export function GameOverOverlay({
  game,
  scores,
  entryId,
  rank,
  onRestart,
  onMenu,
  onShare,
}: {
  game: GameState;
  scores: ScoreEntry[];
  entryId: string | null;
  rank: number | null;
  onRestart: () => void;
  onMenu: () => void;
  onShare?: () => void;
}) {
  const copy = causeCopy(game.cause);
  const multiplier = comboMultiplier(game.shardsCollected);
  const best = scores[0]?.score ?? 0;
  const isRecord = rank === 1;

  return (
    <OverlayFrame labelledBy="over-title">
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            "relative grid h-14 w-14 place-items-center rounded-full border bg-[radial-gradient(circle_at_35%_25%,#2c463d,#080f0d)]",
            isRecord
              ? "border-gold/45 text-gold shadow-[0_0_34px_-8px_rgba(233,201,135,.8)]"
              : "border-danger/30 text-[#f0a99e] shadow-[0_0_30px_-10px_rgba(229,118,108,.7)]"
          )}
        >
          {isRecord ? <IconTrophy className="h-6 w-6" /> : <IconCrescent className="h-6 w-6" />}
          <span className="absolute inset-[4px] rounded-full border border-white/5" />
        </span>

        <p className="eyebrow mt-4 text-[0.56rem] text-gold/55">
          {isRecord ? "новая запись в хронике" : game.cause === "void" ? "стол опустел" : "тень победила"}
        </p>
        <h2 id="over-title" className="mt-1.5 font-display text-[2.35rem] leading-none text-cream">
          {copy.title}
        </h2>
        <p className="mt-2 max-w-sm text-[0.8rem] leading-relaxed text-cream/45">{copy.text}</p>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-gold/20 bg-[linear-gradient(160deg,rgba(44,86,68,.55),rgba(7,20,14,.9))] px-4 py-4 text-center">
        <div className="ornament-line absolute inset-x-6 top-2 text-gold/25">
          <IconStar className="h-2 w-2" />
        </div>
        <p className="text-[0.54rem] font-bold uppercase tracking-[0.22em] text-gold/60">
          итог партии
        </p>
        <p className="mt-1 font-display text-[3.4rem] font-semibold leading-none tabular-nums gold-text">
          {formatScore(game.score)}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.68rem] text-cream/45">
          <span>лучший результат: {formatScore(best)}</span>
          {rank && <span className="h-2.5 w-px bg-gold/20" />}
          {rank && (
            <span className={cn("font-bold", rank === 1 ? "text-gold" : "text-jade/80")}>
              {rank === 1 ? "новый рекорд!" : `входит в топ-${rank}`}
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gold/10 pt-3">
          <ResultStat label="осколки" value={String(game.shardsCollected)} icon={<IconShard className="h-3 w-3" />} />
          <ResultStat label="шаги" value={String(game.moves)} icon={<IconHourglass className="h-3 w-3" />} />
          <ResultStat label="бонус" value={`×${multiplier}`} icon={<IconSparkle className="h-3 w-3" />} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gold/10 bg-black/20 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-cream/45">
            <IconTrophy className="h-3.5 w-3.5 text-gold/70" />
            Хроника рекордов
          </span>
          <span className="text-[0.55rem] uppercase tracking-wider text-cream/25">это устройство</span>
        </div>
        <LeaderboardCompact scores={scores} currentId={entryId} />
      </div>

      <div className="mt-4 space-y-2">
        <button type="button" className="btn btn-gold w-full" onClick={onRestart} autoFocus>
          <IconRestart className="h-4 w-4" />
          Сыграть ещё
          <span className="ml-auto hidden rounded border border-[#24180a]/20 px-1.5 py-0.5 text-[0.56rem] font-extrabold tracking-wider sm:inline-flex">
            ENTER
          </span>
        </button>
        {onShare && (
          <button type="button" className="btn btn-quiet w-full" onClick={onShare}>
            <IconStar className="h-4 w-4 text-gold/80" />
            Поделиться результатом
          </button>
        )}
        <button type="button" className="btn btn-quiet w-full" onClick={onMenu}>
          <IconHome className="h-4 w-4 text-gold/80" />
          Вернуться в меню
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-[0.62rem] text-cream/25">
        <Ornament className="h-2.5 w-10 text-gold/25" />
        мгновенный рестарт · <span className="keycap h-5 min-w-5 text-[0.55rem]">R</span>
        <Ornament className="h-2.5 w-10 text-gold/25" />
      </div>
    </OverlayFrame>
  );
}

function ResultStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center justify-center gap-1 text-[0.52rem] font-bold uppercase tracking-wider text-cream/30">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-xl leading-none tabular-nums text-cream/90">{value}</p>
    </div>
  );
}

function LeaderboardCompact({
  scores,
  currentId,
}: {
  scores: ScoreEntry[];
  currentId: string | null;
}) {
  if (!scores.length) {
    return <p className="py-2 text-center text-xs text-cream/35">Рекорд появится после этой партии.</p>;
  }
  return (
    <ol className="space-y-1">
      {scores.slice(0, 4).map((entry, index) => {
        const isCurrent = entry.id === currentId;
        return (
          <li
            key={entry.id}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1 text-[0.72rem]",
              isCurrent ? "bg-gold/10 text-cream" : "text-cream/55"
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded text-[0.58rem] font-extrabold tabular-nums",
                index === 0
                  ? "bg-gradient-to-b from-gold to-gold-deep text-[#241a08]"
                  : "bg-black/25 text-cream/45"
              )}
            >
              {index + 1}
            </span>
            <span className="flex-1 font-bold tabular-nums">{formatScore(entry.score)}</span>
            <span className="text-[0.6rem] text-cream/30">
              {entry.shards} оск. · {entry.moves} ш.
            </span>
            {isCurrent && (
              <span className="rounded-full border border-gold/30 bg-gold/10 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wider text-gold">
                ты
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
