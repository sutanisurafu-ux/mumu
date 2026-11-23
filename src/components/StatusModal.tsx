import React from 'react';
import { CLASSES } from '../game/rules';
import { EndOfRunSnapshot } from '../game/types';

interface StatusModalProps {
  mode: 'paused' | 'gameover';
  snapshot: EndOfRunSnapshot;
  onResume?: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  mode,
  snapshot,
  onResume,
  onRestart,
  onReturnTitle,
}) => {
  const cls = CLASSES[snapshot.classId];
  const isVictory = mode === 'gameover' && snapshot.outcome === 'victory';
  const isDefeat = mode === 'gameover' && snapshot.outcome === 'defeat';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'paused'
          ? 'Игра на паузе'
          : isVictory
            ? 'Победа в Замке Крови'
            : 'Герой пал в бою'
      }
    >
      <div className="gothic-panel w-full max-w-md rounded-2xl p-6 text-center">
        <p className="text-xs font-semibold tracking-widest text-amber-300">
          {mode === 'paused'
            ? 'ПАУЗА · КОНТИНЕНТ MU'
            : isVictory
              ? 'ТРИУМФ АРХАНГЕЛА · ТЕРРИТОРИЯ ЗАВОЁВАНА'
              : 'ПОРАЖЕНИЕ В БИТВЕ'}
        </p>

        <h2
          className="mt-1 font-display text-2xl font-extrabold text-[#fdf8ed] sm:text-3xl"
          style={{ textWrap: 'balance' }}
        >
          {mode === 'paused'
            ? cls.tierTitles[1]
            : isVictory
              ? 'Владыка Замка Крови Повержен!'
              : 'Герой Пал на Поле Боя'}
        </h2>

        <p className="mt-1.5 text-xs text-[#bfb6a6]">
          Локация: {snapshot.territoryName} · Уровень героя: {snapshot.level}
        </p>

        {/* 3 Tabular-Nums Stat Tiles */}
        <div className="my-5 grid grid-cols-3 gap-2.5 text-left font-mono-num">
          <div className="rounded-xl bg-[#15121e] p-3 border border-amber-500/25">
            <div className="text-[10px] text-[#9c9283]">УБИТО ВРАГОВ</div>
            <div className="mt-1 text-lg font-bold text-[#fdf8ed]">
              {Math.round(snapshot.totalKills)}
            </div>
          </div>

          <div className="rounded-xl bg-[#15121e] p-3 border border-amber-500/25">
            <div className="text-[10px] text-[#9c9283]">
              {isDefeat ? 'ОЗ БОССА' : 'ВРЕМЯ СЕССИИ'}
            </div>
            <div className="mt-1 text-lg font-bold text-amber-300">
              {isDefeat && snapshot.bossHpRemaining > 0
                ? `${Math.round(snapshot.bossHpRemaining)}`
                : `${Math.round(snapshot.clearTimeSec)}с`}
            </div>
          </div>

          <div className="rounded-xl bg-[#15121e] p-3 border border-amber-500/25">
            <div className="text-[10px] text-[#9c9283]">БОЕВАЯ МОЩЬ</div>
            <div className="mt-1 text-lg font-bold text-emerald-300">
              {Math.round(snapshot.combatPower)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {mode === 'paused' && onResume && (
            <button
              type="button"
              onClick={onResume}
              className="min-h-[48px] w-full rounded-xl bg-amber-500 px-5 py-3 font-display text-sm font-bold text-[#09080c] hover:bg-amber-400 cursor-pointer"
            >
              Продолжить Охоту [Esc / P]
            </button>
          )}

          <button
            type="button"
            data-start="true"
            onClick={onRestart}
            className={`min-h-[48px] w-full rounded-xl px-5 py-3 font-display text-sm font-bold cursor-pointer ${
              mode === 'gameover'
                ? 'bg-amber-500 text-[#09080c] hover:bg-amber-400'
                : 'gothic-button text-[#f3efe6]'
            }`}
          >
            {isVictory ? 'Продолжить Завоевание' : 'Возродиться в Лоренсии'}
          </button>

          <button
            type="button"
            onClick={onReturnTitle}
            className="gothic-button min-h-[44px] w-full rounded-xl px-5 py-2.5 text-xs font-semibold text-[#cfc6b8] cursor-pointer"
          >
            К выбору класса
          </button>
        </div>
      </div>
    </div>
  );
};
