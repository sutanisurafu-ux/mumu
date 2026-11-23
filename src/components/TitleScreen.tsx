import React, { useMemo, useState } from 'react';
import { CLASSES, createInitialPlayerState, getClassDisplayTitle } from '../game/rules';
import { CharacterClassId } from '../game/types';
import { HeroModelPreview } from './HeroModelPreview';

interface TitleScreenProps {
  selectedClass: CharacterClassId;
  onSelectClass: (classId: CharacterClassId) => void;
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedClass,
  onSelectClass,
  onStartGame,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const currentClass = CLASSES[selectedClass];
  const previewPlayer = useMemo(() => createInitialPlayerState(selectedClass), [selectedClass]);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-[#07060a] text-[#f3efe6]"
      role="region"
      aria-label="Экран выбора класса и запуска игры"
    >
      {/* Background Key Art with Resilient CSS Fallback & Left Negative-Space Scrim */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {!imgFailed ? (
          <img
            src="/src/assets/images/title_bg_1795377174887.jpg"
            alt="Тёмная готическая цитадель континента MU"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-right opacity-85"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_72%_42%,#2a1e17_0%,#110d16_52%,#060508_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07060a] via-[#07060a]/88 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07060a] via-transparent to-[#07060a]/60" />
      </div>

      {/* Main Content anchored in Left/Center Negative Space */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-6 sm:px-10 lg:px-14">
        <div className="max-w-2xl">
          {/* Custom Inline SVG Title Crest Lockup */}
          <div className="mb-4 flex items-center gap-4">
            <svg
              viewBox="0 0 84 84"
              className="h-16 w-16 shrink-0 drop-shadow-[0_4px_16px_rgba(212,168,83,0.45)] sm:h-20 sm:w-20"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="muGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="50%" stopColor="#d4a853" />
                  <stop offset="100%" stopColor="#85581A" />
                </linearGradient>
              </defs>
              <path
                d="M42 4 L54 18 L78 10 L66 34 L76 48 L56 54 L42 80 L28 54 L8 48 L18 34 L6 10 L30 18 Z"
                fill="#14111a"
                stroke="url(#muGold)"
                strokeWidth="2.5"
              />
              <path
                d="M24 30 L33 54 L42 36 L51 54 L60 30"
                fill="none"
                stroke="url(#muGold)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="42" cy="21" r="4" fill="#f59e0b" />
            </svg>

            <div>
              <p className="text-xs font-medium tracking-widest text-amber-300/80">
                КЛАССИЧЕСКАЯ ИЗОМЕТРИЧЕСКАЯ ARPG · ЭВОЛЮЦИЯ И ANCIENT СЕТЫ
              </p>
              <h1
                className="font-display text-3xl font-extrabold tracking-tight text-[#fdf8ed] sm:text-5xl"
                style={{ textWrap: 'balance' }}
              >
                MU: КОНТИНЕНТ ЛЕГЕНД
              </h1>
            </div>
          </div>

          <p className="mb-5 max-w-xl text-sm leading-relaxed text-[#cfc6b8] sm:text-base">
            Сражайтесь в Лоренсии, Девиасе и Замке Крови, проходите испытание Жрицы Себины на 2-ю и 3-ю профессию, собирайте <span className="font-semibold text-emerald-300">Ancient сеты</span> и куйте Крылья 3-го уровня в Машине Хаоса.
          </p>

          {/* 3-Class Selection Cards */}
          <div
            className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Выбор класса персонажа"
          >
            {(Object.keys(CLASSES) as CharacterClassId[]).map((id) => {
              const cls = CLASSES[id];
              const isSelected = selectedClass === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectClass(id)}
                  aria-pressed={isSelected}
                  className={`group flex min-h-[132px] flex-col justify-between rounded-xl p-4 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#211a2b] ring-2 ring-amber-400 shadow-[0_0_25px_rgba(212,168,83,0.28)]'
                      : 'bg-[#13101a]/90 border border-amber-500/25 hover:border-amber-400/60 hover:bg-[#191522]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-base font-bold text-[#fdf8ed]">
                        {cls.name}
                      </span>
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cls.accentColor }}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium text-amber-300/90">
                      1→3 Проф: {cls.tierTitles[2].split(' ')[0]} · {cls.tierTitles[3].split(' ')[0]}
                    </p>
                    <p className="mt-1.5 text-xs leading-snug text-[#bfb6a8]">
                      {cls.loreShort}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2 text-[11px] text-[#d6cec2] font-mono-num">
                    <span>СИЛ {cls.baseAttributes.str}</span>
                    <span aria-hidden="true">·</span>
                    <span>ЛОВ {cls.baseAttributes.agi}</span>
                    <span aria-hidden="true">·</span>
                    <span>ЭНР {cls.baseAttributes.ene}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Class 2.5D Model, Skill Books & Progression Preview */}
          <div className="gothic-panel mb-5 flex flex-col gap-3.5 rounded-xl p-4 sm:flex-row sm:items-center">
            <div className="flex shrink-0 flex-col items-center">
              <HeroModelPreview player={previewPlayer} width={112} height={112} scale={1.22} />
              <span className="mt-1 text-[10px] font-semibold text-amber-300/90">
                {currentClass.name} (Старт 1 Ур.)
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-amber-300">
                  📚 Книги Навыков в Лавке Города ({getClassDisplayTitle(selectedClass, 1)}):
                </span>
                <span className="text-xs text-emerald-300">
                  Старт голым (бой кулаками) · Авто-Охота с 5 Ур.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {currentClass.skills.map((sk) => (
                  <div
                    key={sk.id}
                    className="rounded-lg bg-[#16121e] px-2.5 py-2 border border-amber-500/20"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#f7f2e8]">
                      <span className="truncate">{sk.name}</span>
                      <span className="font-mono-num text-amber-300">[{sk.keyBinding}]</span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-mono-num text-amber-200/90 truncate">
                      Книга: Ур.{sk.requiredLevel} · {sk.bookPriceZen} Zen
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Start Action */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-start="true"
              onClick={onStartGame}
              className="min-h-[52px] rounded-xl bg-amber-500 px-8 py-3.5 font-display text-base font-bold tracking-wide text-[#09080c] shadow-[0_8px_24px_rgba(245,158,11,0.38)] transition-transform hover:bg-amber-400 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Войти в Континент MU
            </button>
            <span className="text-xs text-[#bfb6a6]">
              Поддерживается комбо-система 1→2→3, NPC в центре Лоренсии и авто-охота
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Safe-Margin Single Flat Borderless Control Hint Line */}
      <div className="relative z-10 px-5 pb-4 pt-2 text-center sm:px-10 sm:text-left">
        <p className="text-xs text-[#9c9283]">
          WASD / Виртуальный стик Движение · Пробел Атака · 1–4 Навыки и Комбо · I Герой, Профессия и Сеты · K Машина Хаоса · P Пауза
        </p>
      </div>
    </div>
  );
};
