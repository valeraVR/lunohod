export const SIZE = 7;
export const TILE_COUNT = SIZE * SIZE;
export const SHARD_TARGET = 3;
export const MAX_LOG = 7;

export type Direction = "up" | "down" | "left" | "right";
export type Tone = "jade" | "gold" | "danger" | "muted";
export type GameOverCause = "shadow" | "void";
export type DifficultyTier = 1 | 2 | 3;

/** Параметры сложности партии */
export interface DifficultyConfig {
  tier: DifficultyTier;
  /** стартовая скорость тени */
  baseShadowSpeed: number;
  /** ходов «изучения», пока тень не идёт */
  graceMoves: number;
  /** старение плиток каждый ход (true) или через ход (false) */
  ageEveryTurn: boolean;
  /** делитель ходов для ускорения тени (меньше = быстрее) */
  speedRampEvery: number;
  /** макс. шагов тени за ход */
  maxShadowSpeed: number;
  /** доп. к скорости после N осколков */
  shardSpeedBoostAt: number;
}

export const DIFFICULTY: Record<DifficultyTier, DifficultyConfig> = {
  1: {
    tier: 1,
    baseShadowSpeed: 1,
    graceMoves: 3,
    ageEveryTurn: false,
    speedRampEvery: 24,
    maxShadowSpeed: 3,
    shardSpeedBoostAt: 14,
  },
  2: {
    tier: 2,
    baseShadowSpeed: 1,
    graceMoves: 1,
    ageEveryTurn: false,
    speedRampEvery: 16,
    maxShadowSpeed: 4,
    shardSpeedBoostAt: 10,
  },
  3: {
    tier: 3,
    baseShadowSpeed: 2,
    graceMoves: 0,
    ageEveryTurn: true,
    speedRampEvery: 12,
    maxShadowSpeed: 5,
    shardSpeedBoostAt: 8,
  },
};

export interface Tile {
  decay: number; // 0 fresh · 1 fragile · 2 critical · 3 void
  glyph: number;
}

export interface LogEntry {
  id: number;
  text: string;
  tone: Tone;
}

export interface GameState {
  player: number;
  shadow: number;
  tiles: Tile[];
  shards: number[];
  star: number | null;
  score: number;
  shardsCollected: number;
  moves: number;
  shadowSpeed: number;
  status: "playing" | "gameover";
  cause: GameOverCause | null;
  log: LogEntry[];
  nudge: number;
  difficulty: DifficultyConfig;
}

export type EventKind =
  | "step"
  | "shard"
  | "star"
  | "shadow"
  | "warning"
  | "void"
  | "blocked"
  | "gameover"
  | "spawn";

export interface GameEvent {
  kind: EventKind;
  tile?: number;
  amount?: number;
  text?: string;
  cause?: GameOverCause;
}

let counter = 1;
export const uid = () => counter++;

export const tileRow = (i: number) => Math.floor(i / SIZE);
export const tileCol = (i: number) => i % SIZE;
export const tileIndex = (row: number, col: number) => row * SIZE + col;
export const manhattan = (a: number, b: number) =>
  Math.abs(tileRow(a) - tileRow(b)) + Math.abs(tileCol(a) - tileCol(b));

const DIRS: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export function neighborOf(index: number, dir: Direction): number | null {
  const [dr, dc] = DIRS[dir];
  const r = tileRow(index) + dr;
  const c = tileCol(index) + dc;
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return null;
  return tileIndex(r, c);
}

export function neighbors(index: number): number[] {
  return (Object.keys(DIRS) as Direction[])
    .map((dir) => neighborOf(index, dir))
    .filter((n): n is number => n !== null);
}

export const comboMultiplier = (shardsCollected: number) =>
  Math.min(5, 1 + Math.floor(shardsCollected / 3));

export const shadowDistance = (state: GameState) =>
  manhattan(state.player, state.shadow);

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function addLog(log: LogEntry[], text: string, tone: Tone): LogEntry[] {
  return [{ id: uid(), text, tone }, ...log].slice(0, MAX_LOG);
}

function reachableTiles(
  tiles: Tile[],
  start: number,
  blocked: number | null
): Set<number> {
  const seen = new Set<number>([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift()!;
    for (const next of neighbors(current)) {
      if (seen.has(next) || next === blocked) continue;
      if (tiles[next].decay >= 2) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return seen;
}

function pickSpawn(
  tiles: Tile[],
  player: number,
  shadow: number,
  occupied: number[],
  minShadowGap: number
): number | null {
  const reachable = reachableTiles(tiles, player, shadow);
  const all = [...reachable].filter(
    (i) => i !== player && i !== shadow && !occupied.includes(i) && tiles[i].decay < 2
  );
  if (!all.length) return null;
  const safe = all.filter((i) => manhattan(i, shadow) >= minShadowGap);
  const pool = safe.length ? safe : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

function farthestFromPlayer(tiles: Tile[], player: number, exclude: number[]): number {
  const candidates = tiles
    .map((tile, i) => ({ tile, i }))
    .filter(({ i }) => i !== player && !exclude.includes(i) && tiles[i].decay < 2)
    .map(({ i }) => i);
  const pool = candidates.length ? candidates : tiles.map((_, i) => i).filter((i) => i !== player);
  let best = pool[0] ?? 0;
  let bestDist = -1;
  for (const i of pool) {
    const d = manhattan(i, player) + Math.random() * 0.9;
    if (d > bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function chooseShadowStep(shadow: number, player: number, tiles: Tile[]): number {
  const options = neighbors(shadow);
  if (!options.length) return shadow;
  let best = options[0];
  let bestScore = Number.POSITIVE_INFINITY;
  for (const next of options) {
    const distance = manhattan(next, player);
    const voidPenalty = tiles[next].decay >= 3 ? 0.85 : 0;
    const score = distance + voidPenalty + Math.random() * 0.4;
    if (score < bestScore) {
      bestScore = score;
      best = next;
    }
  }
  return best;
}

function hasLegalMove(state: Pick<GameState, "tiles" | "player" | "shadow">): boolean {
  return neighbors(state.player).some(
    (i) => state.tiles[i].decay < 2 && i !== state.shadow
  );
}

function freshTiles(): Tile[] {
  return Array.from({ length: TILE_COUNT }, (_, i) => ({
    decay: 0,
    glyph: i % 7,
  }));
}

export function createGame(tier: DifficultyTier = 1): GameState {
  const difficulty = DIFFICULTY[tier] ?? DIFFICULTY[1];
  const tiles = freshTiles();
  const player = tileIndex(5, 1);
  const shadow = tileIndex(0, 6);

  const shards: number[] = [];
  // The first shard always appears close, so the loop starts immediately.
  const nearby = shuffle(
    neighbors(player)
      .flatMap((n) => neighbors(n))
      .filter(
        (i) =>
          i !== player &&
          i !== shadow &&
          manhattan(i, shadow) >= 3 &&
          !shards.includes(i) &&
          tileRow(i) >= 2
      )
  );
  if (nearby.length) shards.push(nearby[0]);

  let guard = 0;
  while (shards.length < SHARD_TARGET && guard < 200) {
    guard++;
    const candidate = pickSpawn(tiles, player, shadow, shards, 3);
    if (candidate !== null && !shards.includes(candidate)) shards.push(candidate);
  }

  const intro =
    tier === 3
      ? "Ультима: Тень голодна и не ждёт."
      : tier === 2
        ? "Средний путь: стол остывает быстрее."
        : "Тень открыла глаза и изучает тебя.";

  return {
    player,
    shadow,
    tiles,
    shards,
    star: null,
    score: 0,
    shardsCollected: 0,
    moves: 0,
    shadowSpeed: difficulty.baseShadowSpeed,
    status: "playing",
    cause: null,
    nudge: 0,
    difficulty,
    log: [
      { id: uid(), text: intro, tone: tier === 3 ? "danger" : "muted" },
      { id: uid(), text: "Твой первый осколок уже рядом.", tone: "jade" },
    ],
  };
}

export interface MoveResult {
  state: GameState;
  events: GameEvent[];
}

export function resolveMove(prev: GameState, dir: Direction): MoveResult {
  if (prev.status !== "playing") return { state: prev, events: [] };
  const events: GameEvent[] = [];
  const target = neighborOf(prev.player, dir);

  if (target === null) {
    return {
      state: { ...prev, nudge: prev.nudge + 1 },
      events: [{ kind: "blocked", text: "Край стола" }],
    };
  }
  const targetTile = prev.tiles[target];
  if (targetTile.decay >= 3) {
    return {
      state: { ...prev, nudge: prev.nudge + 1 },
      events: [{ kind: "blocked", text: "Там уже пустота" }],
    };
  }
  if (targetTile.decay >= 2) {
    return {
      state: { ...prev, nudge: prev.nudge + 1 },
      events: [{ kind: "blocked", text: "Плитка вот-вот рухнет", tile: target }],
    };
  }
  if (target === prev.shadow) {
    return {
      state: { ...prev, nudge: prev.nudge + 1 },
      events: [{ kind: "blocked", text: "Тень не пустит", tile: target }],
    };
  }

  // Age every previously touched tile, reset the tile we land on.
  // Easy: every other turn · Ultima: every turn (стол осыпается быстрее).
  const ageThisTurn = prev.difficulty?.ageEveryTurn ? true : prev.moves % 2 === 0;
  const tiles = prev.tiles.map((tile, i) => {
    if (i === target) return { ...tile, decay: 0 };
    if (tile.decay > 0 && ageThisTurn) {
      return { ...tile, decay: Math.min(3, tile.decay + 1) };
    }
    return tile;
  });
  const oldPlayer = prev.player;
  if (oldPlayer !== target && tiles[oldPlayer].decay === 0) {
    tiles[oldPlayer] = { ...tiles[oldPlayer], decay: 1 };
  }
  prev.tiles.forEach((tile, i) => {
    if (tile.decay < 3 && tiles[i].decay >= 3) events.push({ kind: "void", tile: i });
  });

  let score = prev.score + (prev.moves < 30 ? 10 : 2);
  let shards = [...prev.shards];
  let star = prev.star;
  let shardsCollected = prev.shardsCollected;
  let shadow = prev.shadow;
  let log = prev.log;
  let status: GameState["status"] = "playing";
  let cause: GameOverCause | null = null;
  let collectedSomething = false;
  let skipShadow = false;
  const collectedShard = shards.includes(target);
  const collectedStar = star === target;

  events.push({ kind: "step", tile: target });

  if (collectedShard) {
    const multiplier = comboMultiplier(shardsCollected);
    const amount = 100 * multiplier;
    shards = shards.filter((i) => i !== target);
    score += amount;
    shardsCollected += 1;
    collectedSomething = true;
    events.push({ kind: "shard", tile: target, amount });
    log = addLog(log, `Осколок найден · +${amount}`, "jade");
  }

  if (collectedStar) {
    star = null;
    score += 400;
    collectedSomething = true;
    skipShadow = true;
    events.push({ kind: "star", tile: target, amount: 400 });
    log = addLog(log, "Звёздный ключ! Тень изгнана.", "gold");
  }

  if (collectedShard && !collectedStar) {
    skipShadow = true;
    log = addLog(log, "Блеск осколка ослепил Тень.", "jade");
  }

  const nextMoves = prev.moves + 1;
  const diff = prev.difficulty ?? DIFFICULTY[1];
  const nextSpeed = Math.min(
    diff.maxShadowSpeed,
    diff.baseShadowSpeed +
      Math.floor(nextMoves / diff.speedRampEvery) +
      (shardsCollected >= diff.shardSpeedBoostAt ? 1 : 0)
  );

  // Grace period depends on difficulty tier.
  const grace = prev.moves < diff.graceMoves;

  if (skipShadow) {
    if (collectedStar) {
      shadow = farthestFromPlayer(tiles, target, [...shards, ...(star === null ? [] : [star])]);
    }
    events.push({ kind: "shadow", tile: shadow });
  } else if (grace) {
    if (prev.moves === 1) {
      log = addLog(log, "Тень примеряется к твоему следу.", "muted");
    }
  } else {
    const steps = nextSpeed;
    for (let s = 0; s < steps; s++) {
      shadow = chooseShadowStep(shadow, target, tiles);
      events.push({ kind: "shadow", tile: shadow });
      if (shadow === target) {
        status = "gameover";
        cause = "shadow";
        events.push({ kind: "gameover", cause: "shadow", tile: shadow });
        log = addLog(log, "Тень настигла тебя.", "danger");
        break;
      }
    }
  }

  const marker = star;
  // Keep three shards on the table.
  while (status === "playing" && shards.length < SHARD_TARGET) {
    const occupied = [...shards, ...(marker !== null ? [marker] : [])];
    const spot = pickSpawn(tiles, target, shadow, occupied, 2);
    if (spot === null) break;
    shards.push(spot);
    events.push({ kind: "spawn", tile: spot });
  }

  // A star appears after every third shard.
  if (
    status === "playing" &&
    collectedShard &&
    shardsCollected > 0 &&
    shardsCollected % 2 === 0 &&
    star === null
  ) {
    const spot = pickSpawn(tiles, target, shadow, [...shards], 3);
    if (spot !== null) {
      star = spot;
      events.push({ kind: "spawn", tile: spot });
      log = addLog(log, "На столе зажёгся звёздный ключ.", "gold");
    }
  }

  if (status === "playing" && !hasLegalMove({ tiles, player: target, shadow })) {
    status = "gameover";
    cause = "void";
    events.push({ kind: "gameover", cause: "void", tile: target });
    log = addLog(log, "Тьма сомкнулась — пути больше нет.", "danger");
  }

  if (events.some((e) => e.kind === "void") && !collectedSomething) {
    log = addLog(log, "Плитка осыпалась в пустоту.", "muted");
  }

  if (status === "playing" && nextSpeed > prev.shadowSpeed) {
    events.push({ kind: "warning", text: `Тень ускорилась · ${nextSpeed} шага` });
    log = addLog(
      log,
      `Тень ускорилась: теперь ${nextSpeed} шага за ход.`,
      "danger"
    );
  } else if (status === "playing" && manhattan(target, shadow) <= 1) {
    events.push({ kind: "warning", text: "Тень совсем рядом" });
  }

  return {
    state: {
      ...prev,
      player: target,
      shadow,
      tiles,
      shards,
      star,
      score,
      shardsCollected,
      moves: nextMoves,
      shadowSpeed: nextSpeed,
      difficulty: prev.difficulty ?? DIFFICULTY[1],
      status,
      cause,
      log,
    },
    events,
  };
}

export function causeCopy(cause: GameOverCause | null): { title: string; text: string } {
  if (cause === "void") {
    return {
      title: "Тьма сомкнулась",
      text: "Все пути осыпались. В следующий раз держись ближе к центру стола.",
    };
  }
  return {
    title: "Тень настигла",
    text: "Она шла по твоим следам. Больше звёздных ключей — больше свободы.",
  };
}
