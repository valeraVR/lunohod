import { useCallback, useEffect, useRef, useState } from "react";
import { Board, type BoardHandle } from "@/components/Board";
import {
  Brand,
  Chronicle,
  DPad,
  Leaderboard,
  ScoreBar,
  TensionPanel,
} from "@/components/Hud";
import {
  GameOverOverlay,
  PauseOverlay,
  RulesModal,
} from "@/components/Overlays";
import { StartScreen } from "@/components/StartScreen";
import {
  IconArrow,
  IconBook,
  IconCrescent,
  IconEye,
  IconMuted,
  IconPause,
  IconRestart,
  IconShard,
  IconSound,
  IconStar,
  IconTrophy,
} from "@/components/Icons";
import {
  comboMultiplier,
  createGame,
  manhattan,
  resolveMove,
  type Direction,
  type GameEvent,
  type GameState,
} from "@/lib/game";
import { audio } from "@/lib/audio";
import { loadScores, submitScore, type ScoreEntry } from "@/lib/scores";
import { useTelegram } from "@/hooks/useTelegram";
import { CharacterSelect } from "@/components/CharacterSelect";
import {
  loadMeta,
  saveMeta,
  getCharacter,
  isOwned,
  calcRunCoins,
  tierCompleteBonus,
  type MetaState,
  type CharacterId,
  type CharacterTier,
} from "@/lib/characters";

type Phase = "menu" | "playing" | "paused" | "over";
type ShakeSize = "sm" | "md" | "lg";

const MUTE_KEY = "lunohod.muted.v1";

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

const KEY_DIRECTIONS: Record<string, Direction> = {
  arrowup: "up",
  w: "up",
  ц: "up",
  arrowdown: "down",
  s: "down",
  ы: "down",
  arrowleft: "left",
  a: "left",
  ф: "left",
  arrowright: "right",
  d: "right",
  в: "right",
};

export default function App() {
  const {
    isTelegram,
    haptic,
    userName,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    setClosingConfirmation,
  } = useTelegram();
  const [phase, setPhase] = useState<Phase>("menu");
  const [meta, setMeta] = useState<MetaState>(() => loadMeta());
  const [game, setGame] = useState<GameState>(() => createGame(meta.selectedTier));
  const [gameId, setGameId] = useState(0);
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScores());
  const [muted, setMuted] = useState<boolean>(() => readMuted());
  const [showCharacters, setShowCharacters] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rulesOrigin, setRulesOrigin] = useState<"menu" | "game">("menu");
  const [lastResult, setLastResult] = useState<{ entryId: string; rank: number | null } | null>(
    null
  );
  const [liveMessage, setLiveMessage] = useState("");

  const boardRef = useRef<BoardHandle>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef(game);
  const phaseRef = useRef(phase);
  const lastMoveRef = useRef(0);
  const overTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

  gameRef.current = game;
  phaseRef.current = phase;

  const best = scores[0]?.score ?? 0;

  const stageClass =
    meta.selectedTier === 3 ? "stage-3" : meta.selectedTier === 2 ? "stage-2" : "stage-1";

  // Фон уровня на весь viewport
  useEffect(() => {
    document.body.dataset.stage = String(meta.selectedTier);
    document.body.classList.remove("stage-1", "stage-2", "stage-3");
    document.body.classList.add(stageClass);
    return () => {
      document.body.classList.remove("stage-1", "stage-2", "stage-3");
      delete document.body.dataset.stage;
    };

  }, [meta.selectedTier, stageClass]);


  useEffect(() => {
    audio.setMuted(muted);
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [muted]);

  useEffect(() => {
    return () => {
      if (overTimerRef.current) window.clearTimeout(overTimerRef.current);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      audio.setMuted(next);
      if (!next) audio.play("ui");
      return next;
    });
  }, []);

  const shake = useCallback((size: ShakeSize) => {
    const el = shakeRef.current;
    if (!el) return;
    el.classList.remove("shake-sm", "shake-md", "shake-lg");
    void el.offsetWidth;
    el.classList.add(`shake-${size}`);
    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = window.setTimeout(() => {
      el.classList.remove("shake-sm", "shake-md", "shake-lg");
    }, 620);
  }, []);

  const startGame = useCallback(() => {
    if (overTimerRef.current) {
      window.clearTimeout(overTimerRef.current);
      overTimerRef.current = null;
    }
    const next = createGame(meta.selectedTier);
    gameRef.current = next;
    setGame(next);
    setGameId((id) => id + 1);
    setLastResult(null);
    setShowRules(false);
    setLiveMessage("Партия началась. Собери лунные осколки.");
    setPhase("playing");
    phaseRef.current = "playing";
    audio.play("start");
    haptic.medium();
  }, [haptic, meta.selectedTier]);

  const pause = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    setPhase("paused");
    phaseRef.current = "paused";
    audio.play("pause");
  }, []);

  const resume = useCallback(() => {
    setPhase("playing");
    phaseRef.current = "playing";
    audio.play("ui");
  }, []);

  const goMenu = useCallback(() => {
    if (overTimerRef.current) {
      window.clearTimeout(overTimerRef.current);
      overTimerRef.current = null;
    }
    setPhase("menu");
    phaseRef.current = "menu";
    setShowRules(false);
    setLastResult(null);
    audio.play("ui");
  }, []);

  // Telegram chrome: MainButton, BackButton, confirm close
  useEffect(() => {
    if (!isTelegram) return;

    if (phase === "menu" && !showRules && !showCharacters) {
      showMainButton("Начать партию", () => startGame());
      hideBackButton();
      setClosingConfirmation(false);
    } else if (phase === "playing" && !showRules) {
      hideMainButton();
      showBackButton(() => pause());
      setClosingConfirmation(true);
    } else if (phase === "paused") {
      showMainButton("Продолжить", () => resume());
      showBackButton(() => goMenu());
      setClosingConfirmation(false);
    } else if (phase === "over") {
      showMainButton("Сыграть ещё", () => startGame());
      showBackButton(() => goMenu());
      setClosingConfirmation(false);
    } else {
      hideMainButton();
      hideBackButton();
    }

    return () => {
      hideMainButton();
      hideBackButton();
    };
    // startGame/pause/resume/goMenu stable enough via refs pattern — include phase flags
  }, [
    isTelegram,
    phase,
    showRules,
    showCharacters,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    setClosingConfirmation,
    startGame,
    pause,
    resume,
    goMenu,
  ]);

  const shareResult = useCallback(() => {
    const g = gameRef.current;
    const scoreText = g.score.toLocaleString("ru-RU");
    let message =
      `ЛУНОХОД — итог партии\n\n` +
      `Очки: ${scoreText}\n` +
      `Осколки: ${g.shardsCollected}\n` +
      `Шаги: ${g.moves}\n` +
      `Бонус: ×${comboMultiplier(g.shardsCollected)}`;

    if (lastResult?.rank === 1) {
      message += "\n\nНовый рекорд!";
    } else if (lastResult?.rank) {
      message += `\n\nМесто в топе: ${lastResult.rank}`;
    }

    haptic.light();
    audio.play("ui");

    const tg = window.Telegram?.WebApp as any;
    if (tg) {
      const shareUrl =
        "https://t.me/share/url?url=" +
        encodeURIComponent(window.location.href) +
        "&text=" +
        encodeURIComponent(message);

      try {
        if (typeof tg.openTelegramLink === "function") {
          tg.openTelegramLink(shareUrl);
          return;
        }
      } catch {
        /* continue */
      }

      try {
        if (typeof tg.switchInlineQuery === "function") {
          tg.switchInlineQuery(message, ["users", "groups", "channels"]);
          return;
        }
      } catch {
        /* continue */
      }
    }

    if (navigator.share) {
      navigator
        .share({ title: "ЛУНОХОД", text: message })
        .catch(() => void navigator.clipboard?.writeText(message));
    } else if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(message).then(() => {
        setLiveMessage("Результат скопирован в буфер");
      });
    } else {
      setLiveMessage("Не удалось поделиться");
    }
  }, [haptic, lastResult]);

  const updateMeta = useCallback((next: MetaState) => {
    setMeta(next);
    saveMeta(next);
  }, []);

  const handleBuyCharacter = useCallback(
    (id: CharacterId) => {
      const ch = getCharacter(id);
      if (isOwned(meta, id)) return;
      if (meta.coins < ch.price) {
        setLiveMessage("Не хватает монет");
        haptic.warning();
        return;
      }
      const next: MetaState = {
        ...meta,
        coins: meta.coins - ch.price,
        owned: {
          ...meta.owned,
          [id]: { maxTier: 1, completed: [] },
        },
        selectedId: id,
        selectedTier: 1,
      };
      updateMeta(next);
      haptic.success();
      setLiveMessage(`Открыт жетон «${ch.name}»`);
    },
    [meta, updateMeta, haptic]
  );

  const handleSelectCharacter = useCallback(
    (id: CharacterId, tier: CharacterTier) => {
      if (!isOwned(meta, id)) return;
      const prog = meta.owned[id];
      if (!prog || tier > prog.maxTier) return;
      updateMeta({ ...meta, selectedId: id, selectedTier: tier });
      haptic.selection();
    },
    [meta, updateMeta, haptic]
  );


  const handleEvents = useCallback(
    (events: GameEvent[], previous: GameState) => {
      const kinds = new Set(events.map((event) => event.kind));
      if (kinds.has("gameover")) {
        audio.play("gameover");
        shake("lg");
        haptic.error();
      } else {
        if (kinds.has("star")) {
          audio.play("star");
          shake("lg");
          haptic.success();
        } else if (kinds.has("shard")) {
          audio.play("shard");
          shake("sm");
          haptic.medium();
        } else if (kinds.has("warning")) {
          audio.play("danger");
          shake("sm");
          haptic.warning();
        } else if (kinds.has("blocked")) {
          audio.play("blocked");
          haptic.light();
        } else {
          audio.play("step");
          haptic.selection();
        }
        if (kinds.has("void")) audio.play("void");
      }

      const shardEvent = events.find((event) => event.kind === "shard");
      const starEvent = events.find((event) => event.kind === "star");
      if (starEvent) setLiveMessage("Звёздный ключ! Тень изгнана, плюс 400 очков.");
      else if (shardEvent) setLiveMessage(`Лунный осколок. Плюс ${shardEvent.amount} очков.`);
      else if (kinds.has("gameover"))
        setLiveMessage(
          previous.cause === "void" ? "Тьма сомкнулась. Партия окончена." : "Тень настигла. Партия окончена."
        );
    },
    [shake, haptic]
  );

  const tryMove = useCallback(
    (dir: Direction) => {
      if (phaseRef.current !== "playing" || showRules) return;
      const now = performance.now();
      if (now - lastMoveRef.current < 115) return;
      lastMoveRef.current = now;

      const previous = gameRef.current;
      if (previous.status !== "playing") return;
      const { state, events } = resolveMove(previous, dir);
      gameRef.current = state;
      setGame(state);
      boardRef.current?.fx(events);
      handleEvents(events, state);

      if (state.status === "gameover" && previous.status === "playing") {
        const submission = submitScore({
          score: state.score,
          shards: state.shardsCollected,
          moves: state.moves,
          multiplier: comboMultiplier(state.shardsCollected),
        });
        setScores(submission.scores);
        setLastResult({ entryId: submission.entry.id, rank: submission.rank });

        // Монеты за партию + прогресс персонажа
        setMeta((prev) => {
          const starsApprox = Math.floor(state.shardsCollected / 2);
          let gained = calcRunCoins(state.score, state.shardsCollected, starsApprox);
          const owned = { ...prev.owned };
          const id = prev.selectedId;
          const tier = prev.selectedTier;
          const prog = owned[id] ?? { maxTier: 1 as CharacterTier, completed: [] as CharacterTier[] };
          const completed = new Set(prog.completed);

          // Считаем "прохождением" набор >= 6 осколков (достаточная партия)
          const cleared = state.shardsCollected >= 6;
          if (cleared && !completed.has(tier)) {
            completed.add(tier);
            gained += tierCompleteBonus(tier);
            let maxTier = prog.maxTier;
            if (tier === 1 && maxTier < 2) maxTier = 2;
            if (tier === 2 && maxTier < 3) maxTier = 3;
            owned[id] = { maxTier, completed: Array.from(completed) as CharacterTier[] };
          } else {
            owned[id] = { ...prog, completed: Array.from(completed) as CharacterTier[] };
          }

          const next = { ...prev, coins: prev.coins + gained, owned };
          saveMeta(next);
          setLiveMessage(`+${gained} монет`);
          return next;
        });

        if (overTimerRef.current) window.clearTimeout(overTimerRef.current);
        overTimerRef.current = window.setTimeout(() => {
          setPhase("over");
          phaseRef.current = "over";
          overTimerRef.current = null;
        }, 720);
      }
    },
    [handleEvents, showRules]
  );

  const rulesReturnRef = useRef<Phase>("menu");

  const openRules = useCallback(() => {
    setRulesOrigin(phaseRef.current === "menu" ? "menu" : "game");
    rulesReturnRef.current = phaseRef.current;
    if (phaseRef.current === "playing") {
      setPhase("paused");
      phaseRef.current = "paused";
    }
    setShowRules(true);
    audio.play("ui");
  }, []);

  const closeRules = useCallback(() => {
    setShowRules(false);
    audio.play("ui");
    if (rulesReturnRef.current === "playing" && phaseRef.current === "paused") {
      setPhase("playing");
      phaseRef.current = "playing";
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      const currentPhase = phaseRef.current;

      if (showRules) {
        if (key === "escape") {
          event.preventDefault();
          closeRules();
        } else if (key === "enter") {
          event.preventDefault();
          if (rulesOrigin === "menu") startGame();
          else closeRules();
        }
        return;
      }

      if (currentPhase === "menu") {
        if (key === "enter") {
          event.preventDefault();
          startGame();
        }
        return;
      }

      if (currentPhase === "over") {
        if (key === "enter" || key === "r" || key === " ") {
          event.preventDefault();
          startGame();
        } else if (key === "escape") {
          event.preventDefault();
          goMenu();
        }
        return;
      }

      if (currentPhase === "paused") {
        if (key === "escape" || key === "p" || key === "enter" || key === " ") {
          event.preventDefault();
          resume();
        } else if (key === "r") {
          event.preventDefault();
          startGame();
        } else if (key === "m") {
          toggleMute();
        }
        return;
      }

      const dir = KEY_DIRECTIONS[key];
      if (dir) {
        event.preventDefault();
        tryMove(dir);
        return;
      }
      if (key === "p" || key === "escape") {
        event.preventDefault();
        pause();
      } else if (key === "m") {
        toggleMute();
      } else if (key === "r") {
        event.preventDefault();
        startGame();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    showRules,
    rulesOrigin,
    startGame,
    tryMove,
    pause,
    resume,
    goMenu,
    toggleMute,
    closeRules,
  ]);

  const handlePrimaryRules = () => {
    if (rulesOrigin === "menu") {
      setShowRules(false);
      startGame();
    } else {
      closeRules();
    }
  };

  return (
    <>
      {phase === "menu" ? (
        <StartScreen
          scores={scores}
          muted={muted}
          coins={meta.coins}
          characterName={getCharacter(meta.selectedId).name}
          characterColor={getCharacter(meta.selectedId).color}
          stageClass={stageClass}
          userName={isTelegram ? userName : undefined}
          onStart={startGame}
          onRules={openRules}
          onToggleSound={toggleMute}
          onCharacters={() => setShowCharacters(true)}
        />
      ) : (
        <div className={`game-bg grain relative min-h-dvh ${stageClass}`}>
          <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
            <Brand compact />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className="icon-btn"
                aria-label={muted ? "Включить звук" : "Выключить звук"}
                aria-pressed={!muted}
                onClick={toggleMute}
              >
                {muted ? <IconMuted className="h-4 w-4" /> : <IconSound className="h-4 w-4" />}
              </button>
              <button type="button" className="icon-btn" aria-label="Правила игры" onClick={openRules}>
                <IconBook className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="btn btn-quiet h-10 gap-1.5 px-3 py-0 text-[0.72rem] sm:px-4"
                onClick={phase === "paused" ? resume : pause}
                disabled={phase === "over"}
                aria-label={phase === "paused" ? "Продолжить игру" : "Пауза"}
              >
                <IconPause className="h-3.5 w-3.5 text-gold/80" />
                <span className="hidden sm:inline">{phase === "paused" ? "Продолжить" : "Пауза"}</span>
              </button>
            </div>
          </header>

          <main className="mx-auto grid w-full max-w-[1180px] gap-4 px-3 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-6">
            <div ref={shakeRef} className="min-w-0 will-change-transform">
              <ScoreBar game={game} best={Math.max(best, game.score)} />

              <div
                className="relative mx-auto mt-3 w-full"
                style={{ maxWidth: "min(600px, 64vh)" }}
              >
                <Board
                  key={gameId}
                  ref={boardRef}
                  game={game}
                  interactive={phase === "playing" && !showRules}
                  onMove={tryMove}
                />
              </div>

              <div className="mx-auto mt-3 flex w-full max-w-[600px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="hidden items-center gap-1.5 text-[0.68rem] text-cream/35 sm:flex">
                  <IconArrow className="h-3 w-3 -rotate-90 text-gold/50" />
                  <IconArrow className="h-3 w-3 text-gold/50" />
                  <IconArrow className="h-3 w-3 rotate-180 text-gold/50" />
                  <IconArrow className="h-3 w-3 rotate-90 text-gold/50" />
                  <span className="ml-1">или</span>
                  <span className="keycap">W</span>
                  <span className="keycap">A</span>
                  <span className="keycap">S</span>
                  <span className="keycap">D</span>
                  <span className="mx-1 text-cream/20">·</span>
                  <span className="keycap">P</span>
                  <span>пауза</span>
                </div>
                <p className="text-center text-[0.66rem] font-medium text-cream/35 sm:hidden">
                  {game.moves < 3
                    ? "Свайпни по столу или нажми на соседнюю плитку"
                    : "Шаг: стрелки · свайп · кнопки"}
                </p>

                <DPad
                  onMove={tryMove}
                  disabled={phase !== "playing" || showRules}
                />

                <button
                  type="button"
                  className="btn btn-quiet hidden h-12 gap-2 px-3.5 py-0 text-[0.72rem] sm:inline-flex"
                  onClick={startGame}
                  aria-label="Начать партию заново"
                >
                  <IconRestart className="h-3.5 w-3.5 text-gold/75" />
                  Заново
                  <span className="keycap">R</span>
                </button>
              </div>

              <div className="mx-auto mt-3 hidden w-full max-w-[600px] items-center justify-between gap-3 rounded-xl border border-gold/10 bg-black/15 px-3.5 py-2 sm:flex">
                <span className="flex items-center gap-2 font-display text-[0.82rem] italic tracking-wide text-cream/40">
                  <IconCrescent className="h-3.5 w-3.5 text-gold/50" />
                  Лунный сад · стол №7
                </span>
                <span className="flex items-center gap-3 text-[0.62rem] font-semibold text-cream/40">
                  <span className="flex items-center gap-1.5">
                    <IconShard className="h-3 w-3 text-jade/70" /> +100 × бонус
                  </span>
                  <span className="h-3 w-px bg-gold/15" />
                  <span className="flex items-center gap-1.5">
                    <IconStar className="h-3 w-3 text-gold/70" /> ключ +400
                  </span>
                  <span className="h-3 w-px bg-gold/15" />
                  <span className="flex items-center gap-1.5 text-[#e6a89c]/80">
                    <IconEye className="h-3 w-3" /> шаг тени = ход
                  </span>
                </span>
              </div>

              <div className="mx-auto mt-3 flex w-full max-w-[600px] items-center justify-between gap-2 rounded-xl border border-gold/10 bg-black/20 px-3 py-2 text-[0.62rem] text-cream/35 sm:hidden">
                <span className="flex items-center gap-1.5">
                  <IconTrophy className="h-3.5 w-3.5 text-gold/60" />
                  рекорд {Math.max(best, game.score)}
                </span>
                <span className="h-3 w-px bg-gold/15" />
                <span className="flex items-center gap-1.5">
                  ход {game.moves}
                </span>
                <span className="h-3 w-px bg-gold/15" />
                <span
                  className={
                    manhattan(game.player, game.shadow) <= 2
                      ? "flex items-center gap-1.5 font-bold text-[#ffb2a7]"
                      : "flex items-center gap-1.5"
                  }
                >
                  до тени {manhattan(game.player, game.shadow)}
                </span>
              </div>
            </div>

            <aside className="hidden flex-col gap-3.5 lg:flex">
              <TensionPanel game={game} />
              <Chronicle log={game.log} moves={game.moves} />
              <div className="panel p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display text-lg leading-none text-cream">
                    <IconTrophy className="h-4 w-4 text-gold/75" />
                    Лучшие партии
                  </h3>
                  <span className="text-[0.55rem] font-bold uppercase tracking-wider text-cream/30">
                    это устройство
                  </span>
                </div>
                <Leaderboard scores={scores} limit={4} currentId={lastResult?.entryId ?? null} />
              </div>
            </aside>
          </main>

          <p className="sr-only" aria-live="polite">
            {liveMessage}
          </p>
          {phase !== "over" && (
            <footer className="mx-auto mt-1 w-full max-w-[1180px] px-3 pb-5 text-center text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-cream/20 sm:px-6 sm:text-left">
              Собери осколки · не дай тени коснуться жетона · рекорды хранятся локально
            </footer>
          )}
        </div>
      )}

      {showRules && (
        <RulesModal
          onClose={closeRules}
          onPrimary={handlePrimaryRules}
          primaryLabel={rulesOrigin === "menu" ? "Начать партию" : "Вернуться к столу"}
        />
      )}

      {phase === "paused" && !showRules && (
        <PauseOverlay
          game={game}
          best={Math.max(best, game.score)}
          muted={muted}
          onResume={resume}
          onRestart={startGame}
          onMenu={goMenu}
          onRules={openRules}
          onToggleSound={toggleMute}
        />
      )}

      {phase === "over" && !showRules && (
        <GameOverOverlay
          game={game}
          scores={scores}
          entryId={lastResult?.entryId ?? null}
          rank={lastResult?.rank ?? null}
          onRestart={startGame}
          onMenu={goMenu}
          onShare={shareResult}
        />
      )}

      {showCharacters && (
        <CharacterSelect
          meta={meta}
          onClose={() => setShowCharacters(false)}
          onSelect={handleSelectCharacter}
          onBuy={handleBuyCharacter}
        />
      )}
    </>
  );
}
