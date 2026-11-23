import React, { useState } from 'react';
import {
  calculateDerivedStats,
  getClassDisplayTitle,
  getFirstProfQuestItemName,
} from '../game/rules';
import { CharacterAttributes, PlayerProgressState } from '../game/types';

interface CharacterStatsModalProps {
  player: PlayerProgressState;
  onClose: () => void;
  onAllocateStat: (stat: keyof CharacterAttributes, amount?: number) => void;
  onEvolveClass: () => string;
  onGrandReset: () => string;
}

export const CharacterStatsModal: React.FC<CharacterStatsModalProps> = ({
  player,
  onClose,
  onAllocateStat,
  onEvolveClass,
  onGrandReset,
}) => {
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const derived = calculateDerivedStats(player);
  const displayTitle = getClassDisplayTitle(player.classId, player.classTier);
  const questItemName = getFirstProfQuestItemName(player.classId);

  const statRows: { key: keyof CharacterAttributes; label: string; desc: string }[] = [
    { key: 'str', label: 'Сила (STR)', desc: 'Физический урон и пробитие брони' },
    { key: 'agi', label: 'Ловкость (AGI)', desc: 'Защита, шанс крит. удара и скорость' },
    { key: 'vit', label: 'Живучесть (VIT)', desc: 'Макс. запас здоровья (+7.5 ОЗ)' },
    { key: 'ene', label: 'Энергия (ENE)', desc: 'Мощь заклинаний и запас маны' },
  ];

  return (
    <div
      className="pointer-events-auto fixed left-2.5 top-16 z-40 flex max-h-[80vh] w-[calc(100vw-20px)] max-w-[430px] flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-[#110e19]/95 shadow-[0_16px_48px_rgba(0,0,0,0.92)] sm:left-5 sm:top-20"
      role="dialog"
      aria-modal="false"
      aria-label="Статы Персонажа [C]"
    >
      {/* Compact Modal Header */}
      <div className="flex items-center justify-between border-b border-amber-500/25 bg-[#171222] px-3.5 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500/20 border border-amber-400/50 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-amber-300">
              [C] СТАТЫ
            </span>
            <h2 className="truncate font-display text-sm font-bold text-[#fdf8ed] sm:text-base">
              {displayTitle}
            </h2>
          </div>
          <p className="mt-0.5 font-mono-num text-[11px] text-[#bfb5a4]">
            Уровень {player.level} · Ресеты: {player.resets} · Боевая мощь: {derived.combatPower}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть окно характеристик [C]"
          className="gothic-button min-h-[36px] min-w-[36px] rounded-xl px-2.5 py-1 text-xs font-bold text-amber-200 cursor-pointer"
        >
          ✕ [C]
        </button>
      </div>

      {statusBanner && (
        <div className="border-b border-amber-500/25 bg-[#1d162b] px-3.5 py-1.5 text-[11px] font-medium text-amber-200">
          {statusBanner}
        </div>
      )}

      {/* Modal Scrollable Body */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
        {/* Free Stat Points Counter */}
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-[#181324] px-3 py-2">
          <span className="text-xs font-semibold text-[#f3efe6]">
            Свободные очки характеристик:
          </span>
          <span className="font-mono-num text-base font-extrabold text-amber-400">
            {player.statPoints} очк.
          </span>
        </div>

        {/* 4 Attribute Rows with +1 and +10 Buttons */}
        <div className="flex flex-col gap-1.5">
          {statRows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#15111f] px-3 py-2"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-[#f7f2e8]">{row.label}</div>
                <div className="truncate text-[10px] text-[#a99f90]">{row.desc}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="mr-1 font-mono-num text-sm font-extrabold text-amber-300">
                  {player.attributes[row.key]}
                </span>
                <button
                  type="button"
                  disabled={player.statPoints <= 0}
                  onClick={() => onAllocateStat(row.key, 1)}
                  aria-label={`Повысить ${row.label} на 1`}
                  className="min-h-[34px] min-w-[36px] rounded-lg bg-amber-500 px-2 py-1 font-mono-num text-xs font-bold text-[#09080c] hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  +1
                </button>
                <button
                  type="button"
                  disabled={player.statPoints < 10}
                  onClick={() => onAllocateStat(row.key, 10)}
                  aria-label={`Повысить ${row.label} на 10`}
                  title="Вложить сразу 10 очков характеристик"
                  className="min-h-[34px] min-w-[42px] rounded-lg border border-amber-300/70 bg-gradient-to-b from-amber-400 to-amber-600 px-2 py-1 font-mono-num text-xs font-extrabold text-[#09080c] hover:from-amber-300 hover:to-amber-500 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  +10
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Derived Combat Parameters & Ancient Set Readout */}
        <div className="rounded-xl border border-white/10 bg-[#15121d] p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-300">
              Боевые параметры героя
            </h3>
            <span
              className={`font-mono-num text-[11px] font-bold ${
                derived.activeSetPieceCount >= 3 ? 'text-emerald-300' : 'text-[#9c9283]'
              }`}
            >
              Сет: {derived.activeSetPieceCount}/3
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono-num text-[11px]">
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-[#b5ab9b]">Урон АТК:</span>
              <span className="font-bold text-[#fdf8ed]">
                {derived.minDamage}–{derived.maxDamage}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-[#b5ab9b]">Защита:</span>
              <span className="font-bold text-[#fdf8ed]">{derived.defense}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-[#b5ab9b]">Крит. урон:</span>
              <span className="font-bold text-emerald-300">{derived.critChance}%</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-[#b5ab9b]">Двойной урон:</span>
              <span className="font-bold text-amber-300">{derived.doubleDamageChance}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b5ab9b]">Макс. ОЗ / МН:</span>
              <span className="font-bold text-rose-200">
                {derived.maxHp} / {derived.maxMp}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b5ab9b]">Скорость бега:</span>
              <span className="font-bold text-sky-300">{derived.moveSpeed}</span>
            </div>
          </div>
        </div>

        {/* Quest of Priestess Sevina (1st Profession @ Lvl 50 + Quest Item) & Grand Reset @ Lvl 300 */}
        <div className="rounded-xl border border-amber-500/30 bg-[#181322] p-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-bold text-amber-300">
                Квест Себины (1-я Профа: 50 Ур.)
              </span>
              <span
                className={`rounded px-1.5 py-0.5 font-mono-num text-[10px] font-bold ${
                  player.classTier > 1 || player.hasFirstProfQuestItem
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/50'
                }`}
              >
                {player.classTier > 1
                  ? '✅ 1-я Профа открыта'
                  : player.hasFirstProfQuestItem
                    ? '✅ Квест-айтем выбит'
                    : '❌ Нужен квест-айтем ★'}
              </span>
            </div>

            <p className="text-[10px] leading-snug text-[#bfb6a6]">
              {player.classTier === 1
                ? `Требуется Ур. 50 (${player.level}/50), 3000 Zen и «${questItemName}» с ★ монстров.`
                : player.classTier === 2
                  ? 'Профессия Мастера (Ур. 160+, 12000 Zen): +25% урона и +70 статов.'
                  : 'Вы достигли высшей Профессии Мастера Континента MU!'}
            </p>

            <div className="flex items-center gap-1.5 pt-1">
              {player.classTier < 3 && (
                <button
                  type="button"
                  onClick={() => setStatusBanner(onEvolveClass())}
                  className="min-h-[36px] flex-1 rounded-xl bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-[#09080c] hover:bg-amber-400 cursor-pointer whitespace-nowrap"
                >
                  {player.classTier === 1
                    ? `1-я Профа (${player.level}/50 Ур.)`
                    : `Мастер (${player.level}/160 Ур.)`}
                </button>
              )}
              <button
                type="button"
                onClick={() => setStatusBanner(onGrandReset())}
                className="gothic-button min-h-[36px] rounded-xl px-2.5 py-1 text-[11px] font-semibold text-sky-200 cursor-pointer whitespace-nowrap"
                title="Гранд Ресет с 300 ур.: сохраняет все статы, даёт +150 бонусных очков и умножает АТК/ЗАЩ на +45% за каждый Ресет"
              >
                Ресет ({player.level}/300) · ×{(1 + player.resets * 0.45).toFixed(2)}
              </button>
            </div>
            <p className="text-[10px] leading-snug text-sky-300/90 font-mono-num">
              Гранд Ресет (300 Ур.): сохраняет статы, даёт +150 очков и +45% ко всей АТК/ЗАЩ (обязателен для локаций 150+ ур.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
