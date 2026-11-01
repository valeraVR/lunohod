import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  manhattan,
  neighbors,
  tileCol,
  tileRow,
  uid,
  type Direction,
  type GameEvent,
  type GameState,
  type Tone,
} from "@/lib/game";
import { cn } from "@/utils/cn";
import { Particles, type BurstKind, type ParticlesHandle } from "./Particles";
import { CornerFlourish, IconCrescent, IconShard, IconStar } from "./Icons";

export interface BoardHandle {
  fx: (events: GameEvent[]) => void;
}

interface BoardProps {
  game: GameState;
  interactive: boolean;
  onMove: (dir: Direction) => void;
  playerColor?: string;
}

interface FloatItem {
  id: number;
  tile: number;
  text: string;
  tone: Tone;
}

function Glyph({ variant }: { variant: number }) {
  const cls = "h-[56%] w-[56%]";
  switch (variant % 6) {
    case 0:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="0.9">
          <path d="M16.4 4.4a7.6 7.6 0 1 0 3.2 10.4A6 6 0 0 1 16.4 4.4Z" />
          <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case 1:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="0.9">
          <path d="m12 3 6 9-6 9-6-9 6-9Z" />
          <path d="M6 12h12" opacity="0.6" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1">
          <circle cx="6" cy="17" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="8" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="18.5" cy="14" r="1.4" fill="currentColor" stroke="none" />
          <path d="m6 17 6-9 6.5 6" opacity="0.7" />
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="0.9">
          <circle cx="12" cy="12" r="6.5" />
          <circle cx="12" cy="12" r="2" opacity="0.7" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" opacity="0.6" />
        </svg>
      );
    case 4:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="0.9">
          <path d="M12 3.5c.5 4.4 3.6 7.5 8 8-4.4.5-7.5 3.6-8 8-.5-4.4-3.6-7.5-8-8 4.4-.5 7.5-3.6 8-8Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="0.9">
          <path d="M4 8.5c4 0 5.5 7 9.5 7s5.5-4 6.5-5" opacity="0.8" />
          <path d="M4 15c4 0 5.5-7 9.5-7" opacity="0.5" />
          <circle cx="17.5" cy="16.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

function Cracks() {
  return (
    <svg className="crack" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M6 4 12 15l-3 5 8 4-4 8" stroke="#e0a074" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M12 15 24 11l4 7 8 3" stroke="#d98d63" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
      <path d="M24 11 29 3M23 24l5 6-3 7" stroke="#c77f58" strokeWidth="0.6" strokeLinecap="round" opacity="0.65" />
      <circle cx="33" cy="7" r="0.9" fill="#f0c79d" opacity="0.7" />
      <circle cx="7" cy="31" r="0.7" fill="#f0c79d" opacity="0.5" />
    </svg>
  );
}

function slotStyle(tile: number): CSSProperties {
  return {
    "--col": tileCol(tile),
    "--row": tileRow(tile),
  } as CSSProperties;
}

function directionBetween(from: number, to: number): Direction | null {
  const [r1, c1] = [tileRow(from), tileCol(from)];
  const [r2, c2] = [tileRow(to), tileCol(to)];
  if (r2 === r1 - 1 && c2 === c1) return "up";
  if (r2 === r1 + 1 && c2 === c1) return "down";
  if (c2 === c1 - 1 && r2 === r1) return "left";
  if (c2 === c1 + 1 && r2 === r1) return "right";
  return null;
}

export const Board = forwardRef<BoardHandle, BoardProps>(function Board(
  { game, interactive, onMove, playerColor },
  ref
) {
  const frameRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticlesHandle>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [floats, setFloats] = useState<FloatItem[]>([]);
  const [toast, setToast] = useState<{ id: number; text: string; tone: Tone } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const prevStar = useRef<number | null>(game.star);
  const timersRef = useRef<number[]>([]);

  const showToast = useCallback((text: string, tone: Tone) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    const next = { id: uid(), text, tone };
    setToast(next);
    toastTimer.current = window.setTimeout(() => {
      setToast((current) => (current?.id === next.id ? null : current));
    }, 2450);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (game.star !== null && prevStar.current === null) {
      showToast("На столе звёздный ключ", "gold");
    }
    prevStar.current = game.star;
  }, [game.star, showToast]);

  useEffect(() => {
    showToast("Собери осколки · Тень идёт следом", "gold");
  }, [showToast]);

  const emitBurst = useCallback((tile: number, kind: BurstKind) => {
    const tileEl = gridRef.current?.querySelector<HTMLElement>(`[data-tile="${tile}"]`);
    const table = tableRef.current;
    if (!tileEl || !table) return;
    const tileRect = tileEl.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    particlesRef.current?.burst(
      tileRect.left - tableRect.left + tileRect.width / 2,
      tileRect.top - tableRect.top + tileRect.height / 2,
      kind
    );
  }, []);

  const nudge = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    el.classList.remove("shake-sm");
    void el.offsetWidth;
    el.classList.add("shake-sm");
    window.setTimeout(() => el.classList.remove("shake-sm"), 300);
  }, []);

  const pushFloat = useCallback((tile: number, text: string, tone: Tone) => {
    const item = { id: uid(), tile, text, tone };
    setFloats((current) => [...current.slice(-3), item]);
    const timer = window.setTimeout(
      () => setFloats((current) => current.filter((f) => f.id !== item.id)),
      1050
    );
    timersRef.current.push(timer);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      fx(events: GameEvent[]) {
        for (const event of events) {
          switch (event.kind) {
            case "step":
              if (event.tile !== undefined) emitBurst(event.tile, "step");
              break;
            case "shard":
              if (event.tile !== undefined) {
                emitBurst(event.tile, "shard");
                pushFloat(event.tile, `+${event.amount ?? 100}`, "jade");
              }
              break;
            case "star":
              if (event.tile !== undefined) {
                emitBurst(event.tile, "star");
                pushFloat(event.tile, `+${event.amount ?? 400}`, "gold");
              }
              break;
            case "void":
              if (event.tile !== undefined) emitBurst(event.tile, "void");
              break;
            case "gameover":
              if (event.tile !== undefined) emitBurst(event.tile, "gameover");
              break;
            case "blocked":
              showToast(event.text ?? "Туда нельзя", "muted");
              nudge();
              break;
            case "warning":
              if (event.text) showToast(event.text, "danger");
              break;
            default:
              break;
          }
        }
      },
    }),
    [emitBurst, pushFloat, showToast, nudge]
  );

  const validMoves = new Set(
    neighbors(game.player).filter(
      (i) => game.tiles[i].decay < 2 && i !== game.shadow && game.status === "playing"
    )
  );
  const close = manhattan(game.player, game.shadow) <= 1;

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || !pointerStart.current) return;
    const start = pointerStart.current;
    pointerStart.current = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) > 22) {
      if (Math.abs(dx) > Math.abs(dy)) onMove(dx > 0 ? "right" : "left");
      else onMove(dy > 0 ? "down" : "up");
      return;
    }
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tile]");
    if (!target) return;
    const tile = Number(target.dataset.tile);
    const dir = directionBetween(game.player, tile);
    if (dir) onMove(dir);
  };

  return (
    <div className="board-frame" ref={frameRef}>
      <CornerFlourish className="pointer-events-none absolute left-1.5 top-1.5 z-20 h-7 w-7 text-gold/45 sm:h-9 sm:w-9" />
      <CornerFlourish className="pointer-events-none absolute right-1.5 top-1.5 z-20 h-7 w-7 rotate-90 text-gold/45 sm:h-9 sm:w-9" />
      <CornerFlourish className="pointer-events-none absolute bottom-1.5 right-1.5 z-20 h-7 w-7 rotate-180 text-gold/45 sm:h-9 sm:w-9" />
      <CornerFlourish className="pointer-events-none absolute bottom-1.5 left-1.5 z-20 h-7 w-7 -rotate-90 text-gold/45 sm:h-9 sm:w-9" />

      <div
        className="board-table"
        ref={tableRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (pointerStart.current = null)}
      >
        <div
          className="board-grid"
          ref={gridRef}
          role="group"
          aria-label="Игровое поле семь на семь. Веди лунный жетон стрелками или свайпами."
        >
          {game.tiles.map((tile, i) => {
            const valid = validMoves.has(i);
            return (
              <div
                key={i}
                data-tile={i}
                data-decay={Math.min(3, tile.decay)}
                data-valid={valid ? "true" : "false"}
                className="tile"
                aria-hidden
              >
                <span className="tile-glyph">
                  <Glyph variant={tile.glyph} />
                </span>
                {tile.decay > 0 && tile.decay < 3 && <Cracks />}
                {valid && <span className="reach-dot" />}
              </div>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[15] rounded-[14px] transition-opacity duration-500"
          style={{
            opacity: close ? 1 : 0,
            boxShadow: "inset 0 0 70px 0 rgba(190, 70, 60, 0.35)",
          }}
        />

        <div className="token-layer">
          {game.shards.map((tile) => (
            <div key={`shard-${tile}`} className="token-slot" style={slotStyle(tile)}>
              <div className="shard text-jade">
                <IconShard className="h-full w-full" />
              </div>
            </div>
          ))}
          {game.star !== null && (
            <div key={`star-${game.star}`} className="token-slot" style={slotStyle(game.star)}>
              <div className="star-token">
                <IconStar className="h-full w-full" />
              </div>
            </div>
          )}
          <div className="token-slot" style={slotStyle(game.shadow)}>
            <div className={cn("shadow-token", close && "is-close")}>
              <span className="shadow-eyes" aria-hidden>
                <i />
                <i />
              </span>
            </div>
          </div>
          <div className="token-slot" style={slotStyle(game.player)}>
            <div
              key={game.moves}
              className="moon-token token-pop"
              aria-label="Твой лунный жетон"
              style={{ color: playerColor ?? "#3a2810", filter: `drop-shadow(0 0 6px ${playerColor ?? "#3a2810"})` }}
            >
              <IconCrescent className="h-full w-full" />
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute z-40"
          style={{ inset: "clamp(7px, 1.4vw, 14px)" }}
        >
          {floats.map((f) => {
            const col = tileCol(f.tile);
            const row = tileRow(f.tile);
            const track = "calc((100% - (var(--board-gap) * 6)) / 7)";
            return (
              <span
                key={f.id}
                className="float-gain"
                style={{
                  left: `calc(${track} * (${col} + 0.5) + var(--board-gap) * ${col})`,
                  top: `calc(${track} * (${row} + 0.5) + var(--board-gap) * ${row})`,
                  color:
                    f.tone === "gold"
                      ? "#ffe6a8"
                      : f.tone === "danger"
                        ? "#ffb0a4"
                        : "#d6f7eb",
                }}
              >
                {f.text}
              </span>
            );
          })}
        </div>

        {toast && (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "board-toast absolute left-1/2 top-3 z-50 -translate-x-1/2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase backdrop-blur-sm sm:text-xs",
              toast.tone === "danger"
                ? "border-danger/40 bg-[#2a1210]/85 text-[#ffc5bb]"
                : toast.tone === "gold"
                  ? "border-gold/40 bg-[#241c0d]/85 text-gold"
                  : "border-gold/20 bg-[#0a1712]/85 text-cream/80"
            )}
          >
            {toast.text}
          </div>
        )}

        <Particles
          ref={particlesRef}
          className="absolute inset-0 z-30 h-full w-full"
        />
      </div>
    </div>
  );
});
