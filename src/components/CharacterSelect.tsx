import {
  CHARACTERS,
  RARITY_LABEL,
  TIER_LABEL,
  getCharacter,
  isOwned,
  canSelectTier,
  type CharacterId,
  type CharacterTier,
  type MetaState,
} from "@/lib/characters";
import { IconCrescent, IconStar, Ornament } from "./Icons";
import { cn } from "@/utils/cn";

interface CharacterSelectProps {
  meta: MetaState;
  onClose: () => void;
  onSelect: (id: CharacterId, tier: CharacterTier) => void;
  onBuy: (id: CharacterId) => void;
}

export function CharacterSelect({ meta, onClose, onSelect, onBuy }: CharacterSelectProps) {
  const selected = getCharacter(meta.selectedId);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className={`game-bg grain relative max-h-[92dvh] ${meta.selectedTier === 3 ? "stage-3" : meta.selectedTier === 2 ? "stage-2" : "stage-1"} w-full max-w-lg overflow-y-auto rounded-3xl border border-gold/20 p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] sm:p-5`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-gold/55">
              арсенал жетонов
            </p>
            <h2 className="font-display text-2xl text-cream">Выбор персонажа</h2>
          </div>
          <div className="rounded-full border border-gold/25 bg-black/30 px-3 py-1.5 text-sm font-bold tabular-nums text-gold">
            ◆ {meta.coins}
          </div>
        </div>

        <p className="mt-2 text-[0.78rem] leading-relaxed text-cream/45">
          Открой все цвета. У каждого жетона три уровня: лёгкий → средний →{" "}
          <span className="text-gold/80">Ультима</span>. Самый редкий цвет —{" "}
          <span className="text-[#c45a6a]">Бездна</span>.
        </p>

        <div className="mt-4 space-y-2.5">
          {CHARACTERS.map((ch) => {
            const owned = isOwned(meta, ch.id);
            const prog = meta.owned[ch.id];
            const isSelected = meta.selectedId === ch.id;

            return (
              <div
                key={ch.id}
                className={cn(
                  "rounded-2xl border p-3 transition",
                  isSelected
                    ? "border-gold/40 bg-gold/5"
                    : "border-gold/10 bg-black/25 hover:border-gold/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${ch.color}, #0a100e 70%)`,
                      borderColor: ch.color,
                      boxShadow: `0 0 18px -4px ${ch.glow}`,
                    }}
                  >
                    <IconCrescent className="h-5 w-5 text-white/90" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg leading-none text-cream">{ch.name}</span>
                      <span className="rounded border border-white/10 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-cream/40">
                        {ch.colorName}
                      </span>
                      <span
                        className={cn(
                          "text-[0.55rem] font-bold uppercase tracking-wider",
                          ch.rarity === "legendary"
                            ? "text-[#c45a6a]"
                            : ch.rarity === "epic"
                              ? "text-gold"
                              : "text-cream/35"
                        )}
                      >
                        {RARITY_LABEL[ch.rarity]}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.72rem] text-cream/40">{ch.blurb}</p>
                    <p className="mt-0.5 text-[0.68rem] font-semibold text-gold/70">⚡ {ch.perk}</p>
                  </div>

                  {!owned ? (
                    <button
                      type="button"
                      className="btn btn-gold shrink-0 px-3 py-2 text-xs"
                      onClick={() => onBuy(ch.id)}
                      disabled={meta.coins < ch.price && ch.price > 0}
                    >
                      {ch.price === 0 ? "Взять" : `◆ ${ch.price}`}
                    </button>
                  ) : (
                    <span className="shrink-0 text-[0.6rem] font-bold uppercase tracking-wider text-jade/70">
                      открыт
                    </span>
                  )}
                </div>

                {owned && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {([1, 2, 3] as CharacterTier[]).map((tier) => {
                      const unlocked = canSelectTier(meta, ch.id, tier);
                      const active = isSelected && meta.selectedTier === tier;
                      const done = prog?.completed.includes(tier);
                      return (
                        <button
                          key={tier}
                          type="button"
                          disabled={!unlocked}
                          onClick={() => onSelect(ch.id, tier)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 text-left text-[0.65rem] font-semibold transition",
                            active
                              ? "border-gold/50 bg-gold/15 text-gold"
                              : unlocked
                                ? "border-gold/15 bg-black/30 text-cream/70 hover:border-gold/30"
                                : "cursor-not-allowed border-white/5 bg-black/20 text-cream/25"
                          )}
                        >
                          <span className="block">
                            {tier === 3 ? "Ультима" : `Ур. ${tier}`}
                            {done ? " ✓" : ""}
                          </span>
                          <span className="block text-[0.55rem] font-medium opacity-70">
                            {unlocked ? TIER_LABEL[tier].split("·")[1]?.trim() : "закрыт"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-gold/10 bg-black/20 px-3 py-2.5 text-[0.7rem] text-cream/40">
          <div className="flex items-center gap-2 text-cream/55">
            <IconStar className="h-3.5 w-3.5 text-gold/70" />
            Сейчас выбран:{" "}
            <span className="font-semibold text-cream" style={{ color: selected.color }}>
              {selected.name}
            </span>
            · {TIER_LABEL[meta.selectedTier]}
          </div>
          <p className="mt-1">
            Пройди уровень, чтобы открыть следующий. Ультима — самый сложный, но проходимый режим.
          </p>
        </div>

        <button type="button" className="btn btn-quiet mt-4 w-full" onClick={onClose}>
          Готово
        </button>

        <div className="mt-3 flex items-center justify-center gap-2 text-cream/20">
          <Ornament className="h-2 w-10" />
          <span className="text-[0.55rem] uppercase tracking-widest">коллекция</span>
          <Ornament className="h-2 w-10" />
        </div>
      </div>
    </div>
  );
}
