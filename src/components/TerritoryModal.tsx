import React, { useState } from 'react';
import { getTerritoryMapLayout, TERRITORIES } from '../game/rules';
import { PlayerProgressState, TerritoryId } from '../game/types';

interface TerritoryModalProps {
  player: PlayerProgressState;
  onClose: () => void;
  onSelectTerritory: (id: TerritoryId) => void;
  onEnterBloodCastle: () => string;
  onExitBloodCastle: () => void;
}

function getTerritoryLootTierLabel(idx: number): { label: string; colorClass: string } {
  if (idx <= 2) {
    return { label: 'Вещи: Слабые Common (+0..+1)', colorClass: 'text-[#a39a8c]' };
  }
  if (idx <= 6) {
    return { label: 'Вещи: Common / Magic (+1..+3)', colorClass: 'text-sky-300' };
  }
  if (idx <= 12) {
    return { label: 'Вещи: Magic / Excellent (+2..+5)', colorClass: 'text-emerald-300' };
  }
  if (idx <= 18) {
    return { label: 'Вещи: Excellent / Ancient (+3..+6)', colorClass: 'text-amber-300' };
  }
  return { label: 'Вещи: Высшие Ancient (+4..+7)', colorClass: 'text-amber-400 font-bold' };
}

export const TerritoryModal: React.FC<TerritoryModalProps> = ({
  player,
  onClose,
  onSelectTerritory,
  onEnterBloodCastle,
  onExitBloodCastle,
}) => {
  const [actFilter, setActFilter] = useState<'all' | 'act1' | 'act2' | 'act3'>('all');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const filteredTerritories = TERRITORIES.map((territory, idx) => ({ territory, idx })).filter(
    ({ idx }) => {
      if (actFilter === 'act1') return idx < 8;
      if (actFilter === 'act2') return idx >= 8 && idx < 16;
      if (actFilter === 'act3') return idx >= 16;
      return true;
    }
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Карта 24 городов и ивент-зоны Blood Castle"
    >
      <div className="gothic-panel flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 px-5 py-3.5">
          <div>
            <h2 className="font-display text-lg font-bold text-[#fdf8ed] sm:text-xl">
              Врата Телепорта MU · 24 Уникальных Города и Blood Castle
            </h2>
            <p className="text-xs text-[#bfb5a4]">
              Уникальный ландшафт с тропинками, заборами, речками и мостами! В каждом городе есть <span className="text-amber-300 font-semibold">👑 ВИП-Спот (10 мобов: 8 обычных + 2 дальнебойных)</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть карту городов"
            className="gothic-button min-h-[44px] min-w-[44px] rounded-xl px-4 py-2 text-xs font-semibold text-amber-200 cursor-pointer"
          >
            Закрыть [Esc]
          </button>
        </div>

        {/* FEATURED EVENT ZONE: BLOOD CASTLE (ЗАМОК КРОВИ) */}
        <div className="border-b border-rose-500/35 bg-gradient-to-r from-[#241018] via-[#1c101b] to-[#171221] px-5 py-3.5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-rose-500/25 border border-rose-400/50 px-2 py-0.5 font-mono-num text-[10px] font-extrabold text-rose-300">
                  ОТДЕЛЬНАЯ ИВЕНТ-ЗОНА ДЛЯ ФАРМА
                </span>
                <h3 className="font-display text-sm sm:text-base font-bold text-rose-200">
                  🩸 BLOOD CASTLE (ЗАМОК КРОВИ) · Пройдено: {player.bloodCastleClears}
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#dfd6c9]">
                Мост над Кровавой Бездной с огромными ордами монстров! <span className="text-amber-300 font-semibold">Этапы квеста: 1) Убить 100 монстров на мосту → 2) Сломать Ворота → 3) Разбить Хрустальную Статую → 4) Принести Оружие Архангела к Раненому Архангелу в начале моста.</span> Награда: <span className="text-emerald-300 font-bold">+3 Jewel of Chaos и гора Опыта</span>!
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono-num text-[11px] text-[#bfb5a4]">
                <span>📜 Blood Scroll: <strong className="text-amber-200">{player.bloodScrolls}</strong></span>
                <span>·</span>
                <span>🦷 Blood Fang: <strong className="text-amber-200">{player.bloodFangs}</strong></span>
                <span>·</span>
                <span>💎 Chaos: <strong className="text-amber-200">{player.jewels.chaos}</strong></span>
                <span>·</span>
                <span>🎟️ Готовых Билетов: <strong className="text-emerald-300">{player.bloodCastleTickets}</strong> (варится у Гоблина [K], шанс 80%)</span>
              </div>
              {statusMsg && (
                <p className="mt-1 text-xs font-bold text-amber-300">{statusMsg}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {player.inBloodCastle ? (
                <button
                  type="button"
                  onClick={onExitBloodCastle}
                  className="min-h-[42px] rounded-xl bg-sky-500 px-4 py-2 font-display text-xs font-bold text-[#09080c] hover:bg-sky-400 cursor-pointer whitespace-nowrap"
                >
                  Вернуться из Blood Castle в город
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const msg = onEnterBloodCastle();
                    setStatusMsg(msg);
                  }}
                  className={`min-h-[42px] rounded-xl px-4 py-2 font-display text-xs font-bold cursor-pointer whitespace-nowrap ${
                    player.bloodCastleTickets > 0
                      ? 'bg-rose-600 text-white shadow-[0_4px_16px_rgba(225,29,72,0.5)] hover:bg-rose-500'
                      : 'bg-[#2a1d24] text-rose-200/80 border border-rose-500/35 hover:bg-[#35232c]'
                  }`}
                >
                  🩸 Войти в Blood Castle ({player.bloodCastleTickets} бил.)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Act Filter Tabs for quick navigation across 24 cities */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 bg-[#15111f] px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActFilter('all')}
              className={`min-h-[36px] rounded-xl px-3 py-1 text-xs font-bold cursor-pointer ${
                actFilter === 'all'
                  ? 'bg-amber-500 text-[#09080c]'
                  : 'gothic-button text-[#dfd7c8]'
              }`}
            >
              Все 24 города
            </button>
            <button
              type="button"
              onClick={() => setActFilter('act1')}
              className={`min-h-[36px] rounded-xl px-3 py-1 text-xs font-bold cursor-pointer ${
                actFilter === 'act1'
                  ? 'bg-amber-500 text-[#09080c]'
                  : 'gothic-button text-[#dfd7c8]'
              }`}
            >
              Акт I: Города 1–8 (Common → Magic)
            </button>
            <button
              type="button"
              onClick={() => setActFilter('act2')}
              className={`min-h-[36px] rounded-xl px-3 py-1 text-xs font-bold cursor-pointer ${
                actFilter === 'act2'
                  ? 'bg-amber-500 text-[#09080c]'
                  : 'gothic-button text-[#dfd7c8]'
              }`}
            >
              Акт II: Города 9–16 (Magic → Excellent)
            </button>
            <button
              type="button"
              onClick={() => setActFilter('act3')}
              className={`min-h-[36px] rounded-xl px-3 py-1 text-xs font-bold cursor-pointer ${
                actFilter === 'act3'
                  ? 'bg-amber-500 text-[#09080c]'
                  : 'gothic-button text-[#dfd7c8]'
              }`}
            >
              Акт III: Города 17–24 (Ancient · Ресеты)
            </button>
          </div>
          <span className="font-mono-num text-xs text-amber-300">
            Открыто городов: {Math.min(TERRITORIES.length, player.highestReachedTerritoryIdx + 1)} / {TERRITORIES.length}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTerritories.map(({ territory, idx }) => {
            const isCurrent = !player.inBloodCastle && player.territoryId === territory.id;
            const isLocked = idx > player.highestReachedTerritoryIdx;
            const dropsChaosFromMobs = territory.recommendedLevel >= 150;
            const lootTier = getTerritoryLootTierLabel(idx);
            const mapLayout = getTerritoryMapLayout(territory.id);
            const vipCamp = mapLayout.camps.find((c) => c.isVip);

            return (
              <div
                key={territory.id}
                className={`flex flex-col justify-between gap-2.5 rounded-xl p-3.5 border ${
                  isCurrent
                    ? 'bg-[#211a2d] border-amber-400'
                    : isLocked
                      ? 'bg-[#121017] border-white/10 opacity-60'
                      : 'bg-[#16121f] border-amber-500/25'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: territory.accentColor }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-display text-xs sm:text-sm font-bold text-[#fdf8ed]">
                        {territory.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300 font-mono-num">
                      Ур. {territory.recommendedLevel}+ · Мощь ×{territory.enemyLevelMultiplier.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#bfb6a6]">{territory.subtitle}</p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono-num">
                    <span className="text-[#9c9283]">
                      Босс: <span className="text-rose-300">{territory.bossName}</span> (20% Chaos)
                    </span>
                    <span className={dropsChaosFromMobs ? 'text-amber-300 font-bold' : 'text-[#8c8273]'}>
                      {dropsChaosFromMobs ? '💎 Мобы: Chaos (150+)' : '💎 Только Босс 20%'}
                    </span>
                  </div>
                  <div className={`mt-1 text-[10px] font-mono-num ${lootTier.colorClass}`}>
                    {lootTier.label} · Scroll & Fang
                  </div>
                  <div className="mt-1.5 rounded-lg border border-amber-500/25 bg-[#120e1a] px-2 py-1 text-[10px] font-mono-num text-amber-200/95">
                    <div>
                      🗺️ Тропинки ({mapLayout.trails.length}) · Заборы ({mapLayout.fences.length}) · Речки ({mapLayout.rivers.length})
                    </div>
                    {vipCamp && (
                      <div className="mt-0.5 text-amber-300 font-semibold truncate">
                        {vipCamp.title} (10 мобов: +2 дальних)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10">
                  <span
                    className={`text-[10px] font-mono-num ${
                      isLocked ? 'text-rose-300/80' : 'text-emerald-300/90'
                    }`}
                  >
                    {isLocked
                      ? `🔒 Ур. ${territory.recommendedLevel}+`
                      : '🛡️ Город открыт'}
                  </span>
                  <button
                    type="button"
                    disabled={isLocked || isCurrent}
                    onClick={() => onSelectTerritory(territory.id)}
                    className="min-h-[38px] rounded-xl bg-amber-500 px-3 py-1 font-display text-xs font-bold text-[#09080c] transition-transform hover:bg-amber-400 active:scale-95 disabled:bg-[#221d2b] disabled:text-[#8c8273] disabled:pointer-events-none cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isCurrent
                      ? 'Вы здесь'
                      : isLocked
                        ? 'Победите Босса'
                        : 'Телепорт'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
