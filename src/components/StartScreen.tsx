import { Brand, Leaderboard } from "./Hud";
import {
  IconBook,
  IconCrescent,
  IconHourglass,
  IconMuted,
  IconPlay,
  IconShard,
  IconSound,
  IconSparkle,
  IconStar,
  IconTrophy,
  Ornament,
} from "./Icons";
import { formatScore, type ScoreEntry } from "@/lib/scores";
import heroImg from "@/assets/lunohod-hero.jpg";

interface StartScreenProps {
  scores: ScoreEntry[];
  muted: boolean;
  coins?: number;
  characterName?: string;
  characterColor?: string;
  onStart: () => void;
  onRules: () => void;
  onToggleSound: () => void;
  onCharacters?: () => void;
  stageClass?: string;
  userName?: string;
}

const HERO = heroImg;

export function StartScreen({
  scores,
  muted,
  coins = 0,
  characterName = "Пепел",
  characterColor = "#9aa3a0",
  onStart,
  onRules,
  onToggleSound,
  onCharacters,
  stageClass = "stage-1",
  userName,
}: StartScreenProps) {
  const best = scores[0]?.score ?? 0;

  return (
    <div className={`game-bg grain relative min-h-dvh overflow-hidden ${stageClass}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={HERO}
          alt=""
          className="hero-photo h-full w-full object-cover opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_62%_38%,rgba(46,143,120,.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
        <div className="absolute -right-24 top-10 h-[26rem] w-[26rem] rounded-full border border-gold/10 sm:-right-10 sm:h-[34rem] sm:w-[34rem]" />
        <div className="absolute -right-10 top-24 h-[18rem] w-[18rem] rounded-full border border-gold/[0.07] sm:right-16 sm:h-[24rem] sm:w-[24rem]" />
        <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-jade/10 blur-[90px]" />
      </div>

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
        <Brand />
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-quiet hidden h-10 px-4 py-0 text-xs sm:inline-flex" onClick={onRules}>
            <IconBook className="h-4 w-4 text-gold/80" />
            Правила
          </button>
          <button type="button" className="icon-btn sm:hidden" aria-label="Правила" onClick={onRules}>
            <IconBook className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={muted ? "Включить звук" : "Выключить звук"}
            aria-pressed={!muted}
            onClick={onToggleSound}
          >
            {muted ? <IconMuted className="h-4 w-4" /> : <IconSound className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-10 pt-2 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:pb-14 md:pt-8">
        <div className="start-in max-w-xl">
          <p className="flex items-center gap-3 text-[0.6rem] font-extrabold uppercase tracking-[0.26em] text-gold/70 sm:text-[0.66rem]">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/60" />
            настольная игра · один игрок
          </p>

          <h1 className="mt-4 font-display text-[clamp(3.8rem,15vw,7rem)] font-semibold leading-[0.82] tracking-[0.06em]">
            <span className="gold-text drop-shadow-[0_10px_28px_rgba(233,201,135,0.18)]">
              ЛУНОХОД
            </span>
          </h1>

          <div className="ornament-line mt-4 max-w-sm text-gold/60">
            <IconStar className="h-2.5 w-2.5" />
          </div>

          {userName && (
            <p className="mt-4 text-[0.75rem] font-medium tracking-wide text-gold/55">
              Добро пожаловать, {userName}
            </p>
          )}

          <p className="mt-5 max-w-md font-display text-[clamp(1.25rem,4vw,1.6rem)] leading-snug text-cream/90">
            Собери лунные осколки, пока стол не рассыпался под ногами.
          </p>
          <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-cream/50">
            Веди лунный жетон по семи дорожкам, уходи от Тени и помни: каждая плитка,
            которую ты покидаешь, начинает осыпаться.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button" className="btn btn-gold group w-full px-6 text-[0.95rem] sm:w-auto" onClick={onStart}>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#24180a]/10">
                <IconPlay className="h-3.5 w-3.5 translate-x-px" />
              </span>
              Начать партию
              <span className="ml-1 hidden rounded border border-[#24180a]/20 px-1.5 py-0.5 text-[0.58rem] font-extrabold tracking-wider sm:inline">
                ENTER
              </span>
            </button>
            {onCharacters && (
              <button type="button" className="btn btn-quiet w-full sm:w-auto" onClick={onCharacters}>
                <span
                  className="grid h-5 w-5 place-items-center rounded-full border"
                  style={{ background: characterColor, borderColor: characterColor }}
                />
                Выбор персонажа
              </button>
            )}
            <button type="button" className="btn btn-quiet w-full sm:w-auto" onClick={onRules}>
              <IconBook className="h-4 w-4 text-gold/80" />
              Как играть
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.72rem] text-cream/40">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-black/25 px-2.5 py-1 font-bold tabular-nums text-gold/80">
              ◆ {coins}
            </span>
            <span className="inline-flex items-center gap-1.5">
              жетон:
              <span className="font-semibold text-cream" style={{ color: characterColor }}>
                {characterName}
              </span>
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] font-medium text-cream/40">
            <span className="flex items-center gap-1.5">
              <IconSparkle className="h-3.5 w-3.5 text-jade/70" />
              <span className="sm:hidden">Свайп или кнопки</span>
              <span className="hidden sm:inline">Стрелки, WASD или свайп</span>
            </span>
            <span className="flex items-center gap-1.5">
              <IconHourglass className="h-3.5 w-3.5 text-jade/70" />
              Партия 3–6 минут
            </span>
            {best > 0 && (
              <span className="flex items-center gap-1.5 text-gold/70">
                <IconTrophy className="h-3.5 w-3.5" />
                Рекорд {formatScore(best)}
              </span>
            )}
          </div>

          <div className="mt-8 max-w-md rounded-2xl border border-gold/12 bg-black/25 p-3.5 backdrop-blur-[2px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconTrophy className="h-4 w-4 text-gold/75" />
                <h2 className="font-display text-base leading-none text-cream/90">
                  Хроника рекордов
                </h2>
              </div>
              <span className="text-[0.56rem] font-bold uppercase tracking-wider text-cream/30">
                локально · топ-3
              </span>
            </div>
            <div className="mt-2.5">
              <Leaderboard scores={scores} limit={3} />
            </div>
          </div>
        </div>

        <div className="start-in-delayed relative mx-auto hidden w-full max-w-[390px] md:block">
          <div className="absolute -inset-5 rounded-[34px] bg-gold/5 blur-2xl" aria-hidden />
          <div className="relative rounded-[26px] border border-gold/30 bg-[linear-gradient(160deg,#183b2f,#091913)] p-2.5 shadow-[0_40px_90px_-30px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.12)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-gold/15 bg-ink">
              <img
                src={HERO}
                alt="Стол «Лунный сад»: нефритовые плитки, латунный жетон и осколки луны"
                className="absolute inset-0 h-full w-full object-cover opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04100b] via-[#04100b]/15 to-[#04100b]/45" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                <span className="rounded-full border border-gold/25 bg-black/35 px-2.5 py-1 text-[0.56rem] font-extrabold uppercase tracking-[0.2em] text-gold/85 backdrop-blur-sm">
                  стол № 7
                </span>
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <IconStar
                      key={i}
                      className="h-2.5 w-2.5 animate-twinkle text-gold/80"
                      style={{ animationDelay: `${i * 0.6}s` }}
                    />
                  ))}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="ornament-line mb-3 text-gold/60">
                  <IconCrescent className="h-4 w-4" />
                </div>
                <p className="font-display text-3xl leading-none text-cream">Лунный сад</p>
                <p className="mt-2 max-w-[16rem] text-[0.76rem] leading-relaxed text-cream/50">
                  Три осколка. Один звёздный ключ. И Тень, которая всегда делает шаг вслед за тобой.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-jade/25 bg-jade/10 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-jade">
                    <IconShard className="h-3 w-3" /> 3 осколка
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-gold">
                    <IconStar className="h-3 w-3" /> ключ
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-4 rounded-xl border border-gold/25 bg-[#0a1a14]/95 px-3.5 py-2.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] backdrop-blur">
            <p className="text-[0.52rem] font-extrabold uppercase tracking-[0.18em] text-gold/60">
              твой рекорд
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 font-display text-2xl leading-none tabular-nums text-cream">
              <IconTrophy className="h-4 w-4 text-gold/80" />
              {best > 0 ? formatScore(best) : "— — —"}
            </p>
          </div>

          <div className="absolute -right-3 bottom-16 flex -rotate-3 flex-col items-center rounded-full border border-gold/30 bg-[linear-gradient(145deg,#f2d99f,#b98f4d)] px-3.5 py-3 text-center text-[#241a08] shadow-[0_18px_40px_-16px_rgba(0,0,0,.8)]">
            <IconCrescent className="h-4 w-4" />
            <span className="mt-0.5 text-[0.5rem] font-extrabold uppercase tracking-[0.12em]">один игрок</span>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 border-t border-gold/10 px-4 py-5 text-[0.66rem] text-cream/30 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-jade/70" /> Без регистрации
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-gold/70" /> Сохранение рекордов на устройстве
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-cream/40" /> Клавиатура и касания
          </span>
        </span>
        <span className="flex items-center gap-2 font-display text-sm italic text-cream/35">
          <Ornament className="h-3 w-14 text-gold/30" />
          вечер, свечи, семь дорожек
        </span>
      </footer>
    </div>
  );
}
