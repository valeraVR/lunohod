export type CharacterId = "ash" | "moss" | "azure" | "amethyst" | "solar" | "abyss";
export type CharacterTier = 1 | 2 | 3;

export interface CharacterDef {
  id: CharacterId;
  name: string;
  colorName: string;
  /** CSS color for token */
  color: string;
  /** Soft glow */
  glow: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  price: number;
  blurb: string;
  perk: string;
}

/** Самый редкий цвет — Бездна (чёрно-багровый). */
export const CHARACTERS: CharacterDef[] = [
  {
    id: "ash",
    name: "Пепел",
    colorName: "Серый",
    color: "#9aa3a0",
    glow: "rgba(154,163,160,0.45)",
    rarity: "common",
    price: 0,
    blurb: "Стартовый жетон. Спокойный и надёжный.",
    perk: "Без бонусов — базовый опыт.",
  },
  {
    id: "moss",
    name: "Мох",
    colorName: "Зелёный",
    color: "#3d9b78",
    glow: "rgba(61,155,120,0.5)",
    rarity: "common",
    price: 250,
    blurb: "Оттенок лунной травы.",
    perk: "+25% монет за осколки.",
  },
  {
    id: "azure",
    name: "Лазурь",
    colorName: "Синий",
    color: "#4a8fd4",
    glow: "rgba(74,143,212,0.5)",
    rarity: "uncommon",
    price: 600,
    blurb: "Холодный свет дальнего кратера.",
    perk: "+10% к очкам за каждый шаг.",
  },
  {
    id: "amethyst",
    name: "Аметист",
    colorName: "Фиолетовый",
    color: "#9b6ddb",
    glow: "rgba(155,109,219,0.55)",
    rarity: "rare",
    price: 1200,
    blurb: "Редкий отблеск ночного кристалла.",
    perk: "Тень на 1 шаг медленнее.",
  },
  {
    id: "solar",
    name: "Солярис",
    colorName: "Золотой",
    color: "#e8c46a",
    glow: "rgba(232,196,106,0.55)",
    rarity: "epic",
    price: 2000,
    blurb: "Тёплый металл солнечной пыли.",
    perk: "+20% к очкам за каждый шаг.",
  },
  {
    id: "abyss",
    name: "Бездна",
    colorName: "Багрово-чёрный",
    color: "#8b1e3a",
    glow: "rgba(139,30,58,0.65)",
    rarity: "legendary",
    price: 4000,
    blurb: "Самый редкий цвет. Тьма с кромкой крови.",
    perk: "Тень на 1 шаг быстрее, +50% монет за звёзды.",
  },
];

export const RARITY_LABEL: Record<CharacterDef["rarity"], string> = {
  common: "Обычный",
  uncommon: "Необычный",
  rare: "Редкий",
  epic: "Эпический",
  legendary: "Легендарный",
};

export const TIER_LABEL: Record<CharacterTier, string> = {
  1: "Уровень 1 · Лёгкий",
  2: "Уровень 2 · Средний",
  3: "Ультима · Сложный",
};

export interface OwnedProgress {
  /** max unlocked tier 1-3 */
  maxTier: CharacterTier;
  /** completed tiers (beat a run on that tier) */
  completed: CharacterTier[];
}

export interface MetaState {
  coins: number;
  selectedId: CharacterId;
  selectedTier: CharacterTier;
  owned: Partial<Record<CharacterId, OwnedProgress>>;
}

const META_KEY = "lunohod.meta.v1";

export function defaultMeta(): MetaState {
  return {
    coins: 0,
    selectedId: "ash",
    selectedTier: 1,
    owned: {
      ash: { maxTier: 1, completed: [] },
    },
  };
}

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return defaultMeta();
    const parsed = JSON.parse(raw) as MetaState;
    if (!parsed.owned?.ash) {
      parsed.owned = { ...parsed.owned, ash: { maxTier: 1, completed: [] } };
    }
    if (!parsed.selectedId) parsed.selectedId = "ash";
    if (!parsed.selectedTier) parsed.selectedTier = 1;
    if (typeof parsed.coins !== "number") parsed.coins = 0;
    return parsed;
  } catch {
    return defaultMeta();
  }
}

export function saveMeta(meta: MetaState) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

export function getCharacter(id: CharacterId): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

/** Геймплейные модификаторы персонажа */
export interface CharacterMods {
  /** множитель очков за шаг/сбор */
  scoreMult: number;
  /** дельта к скорости тени (может быть отрицательной) */
  shadowSpeedDelta: number;
  /** бонус к монетам за осколки (множитель) */
  shardCoinMult: number;
  /** бонус к монетам за звёзды (множитель) */
  starCoinMult: number;
}

export function getCharacterMods(id: CharacterId): CharacterMods {
  switch (id) {
    case "moss":
      return { scoreMult: 1.0, shadowSpeedDelta: 0, shardCoinMult: 1.25, starCoinMult: 1.0 };
    case "azure":
      return { scoreMult: 1.1, shadowSpeedDelta: 0, shardCoinMult: 1.0, starCoinMult: 1.0 };
    case "amethyst":
      return { scoreMult: 1.0, shadowSpeedDelta: -1, shardCoinMult: 1.0, starCoinMult: 1.0 };
    case "solar":
      return { scoreMult: 1.2, shadowSpeedDelta: 0, shardCoinMult: 1.0, starCoinMult: 1.0 };
    case "abyss":
      return { scoreMult: 1.0, shadowSpeedDelta: 1, shardCoinMult: 1.0, starCoinMult: 1.5 };
    default:
      return { scoreMult: 1.0, shadowSpeedDelta: 0, shardCoinMult: 1.0, starCoinMult: 1.0 };
  }
}

export function isOwned(meta: MetaState, id: CharacterId): boolean {
  return Boolean(meta.owned[id]);
}

export function canSelectTier(meta: MetaState, id: CharacterId, tier: CharacterTier): boolean {
  const prog = meta.owned[id];
  if (!prog) return false;
  return tier <= prog.maxTier;
}

/** Coins earned at end of a run */
export function calcRunCoins(
  score: number,
  shards: number,
  starsApprox: number,
  mods?: CharacterMods
): number {
  const m = mods ?? { scoreMult: 1, shadowSpeedDelta: 0, shardCoinMult: 1, starCoinMult: 1 };
  const fromScore = Math.floor((score / 60) * m.scoreMult);
  const fromShards = Math.round(shards * 3 * m.shardCoinMult);
  const fromStars = Math.round(starsApprox * 10 * m.starCoinMult);
  return Math.max(3, fromScore + fromShards + fromStars);
}

export function tierCompleteBonus(tier: CharacterTier): number {
  if (tier === 1) return 100;
  if (tier === 2) return 250;
  return 500;
}
