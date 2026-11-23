import React, { useState } from 'react';
import {
  calculateItemEffectiveAttack,
  calculateItemEffectiveDefense,
} from '../game/rules';
import { EquipmentItem, ItemSlot, PlayerProgressState } from '../game/types';

interface ChaosMachineModalProps {
  player: PlayerProgressState;
  onClose: () => void;
  onUpgradeWithJewel: (itemId: string, jewelType: 'bless' | 'soul' | 'life') => string;
  onCraftWings: () => string;
  onCraftBloodCastleTicket: () => string;
  onEnterBloodCastle: () => string;
}

export const ChaosMachineModal: React.FC<ChaosMachineModalProps> = ({
  player,
  onClose,
  onUpgradeWithJewel,
  onCraftWings,
  onCraftBloodCastleTicket,
  onEnterBloodCastle,
}) => {
  const [craftMessage, setCraftMessage] = useState<string>(
    'Варите Билет в Blood Castle (Скрол + Фанг + Чаос, шанс 80%), синтезируйте Крылья или затачивайте экипировку камнями Bless, Soul и Life.'
  );

  const equippedList: { slot: ItemSlot; item: EquipmentItem }[] = [];
  (['weapon', 'armor', 'helm', 'wings', 'ring', 'pendant'] as ItemSlot[]).forEach((slot) => {
    const it = player.equipped[slot];
    if (it) equippedList.push({ slot, item: it });
  });

  const hasWings = player.equipped.wings !== null;
  const canCraftBcTicket =
    player.bloodScrolls >= 1 && player.bloodFangs >= 1 && player.jewels.chaos >= 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Машина Хаоса Гоблина Нории"
    >
      <div className="gothic-panel flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/25 px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-amber-300 sm:text-xl">
              Машина Хаоса · Гоблин Нории
            </h2>
            <p className="text-xs text-[#bfb5a4] font-mono-num">
              Scroll: {player.bloodScrolls} · Fang: {player.bloodFangs} · Chaos: {player.jewels.chaos} · Билет BC: {player.bloodCastleTickets} · Bless: {player.jewels.bless} · Soul: {player.jewels.soul} · Life: {player.jewels.life}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть Машину Хаоса"
            className="gothic-button min-h-[44px] min-w-[44px] rounded-xl px-4 py-2 text-xs font-semibold text-amber-200 cursor-pointer"
          >
            Закрыть [Esc]
          </button>
        </div>

        {/* Status Message Banner */}
        <div className="bg-[#1b1525] px-5 py-3 text-xs font-medium text-amber-200 border-b border-amber-500/20">
          {craftMessage}
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          {/* Section 0: Blood Castle Ticket Synthesis (Scroll + Fang + Chaos, 80% success) */}
          <div className="rounded-xl bg-[#1f1218] p-4 border border-rose-500/45 shadow-[0_0_24px_rgba(244,63,94,0.16)]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-rose-500/25 border border-rose-400/50 px-2 py-0.5 font-mono-num text-[10px] font-extrabold text-rose-300">
                    ШАНС УСПЕХА 80%
                  </span>
                  <h3 className="font-display text-base font-bold text-[#fdf8ed]">
                    🩸 Синтез Билета в Blood Castle (Плащ Невидимости)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-[#dfd5c8]">
                  Открывает вход в отдельную ивент-зону с мостом! Убейте 100 монстров на мосту, сломайте ворота, разбейте статую и принесите Оружие Архангела раненому Архангелу за <span className="text-amber-300 font-bold">+3 Jewel of Chaos и огромный Опыт</span>.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 font-mono-num text-xs">
                  <span
                    className={
                      player.bloodScrolls >= 1 ? 'text-emerald-300 font-bold' : 'text-rose-300'
                    }
                  >
                    📜 Blood Scroll: {player.bloodScrolls}/1
                  </span>
                  <span className="text-white/30">+</span>
                  <span
                    className={
                      player.bloodFangs >= 1 ? 'text-emerald-300 font-bold' : 'text-rose-300'
                    }
                  >
                    🦷 Blood Fang: {player.bloodFangs}/1
                  </span>
                  <span className="text-white/30">+</span>
                  <span
                    className={
                      player.jewels.chaos >= 1 ? 'text-emerald-300 font-bold' : 'text-rose-300'
                    }
                  >
                    💎 Jewel of Chaos: {player.jewels.chaos}/1
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="text-amber-300 font-bold">
                    🎟️ Билетов: {player.bloodCastleTickets}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const msg = onCraftBloodCastleTicket();
                    setCraftMessage(msg);
                  }}
                  className={`min-h-[44px] rounded-xl px-4 py-2 font-display text-xs font-bold cursor-pointer whitespace-nowrap ${
                    canCraftBcTicket
                      ? 'bg-rose-600 text-white shadow-[0_4px_16px_rgba(225,29,72,0.45)] hover:bg-rose-500'
                      : 'bg-[#2a1d24] text-rose-200/75 border border-rose-500/30 hover:bg-[#35232c]'
                  }`}
                >
                  Сварить Билет в Blood Castle (80%)
                </button>

                {player.bloodCastleTickets > 0 && !player.inBloodCastle && (
                  <button
                    type="button"
                    onClick={() => {
                      const msg = onEnterBloodCastle();
                      setCraftMessage(msg);
                    }}
                    className="min-h-[40px] rounded-xl bg-amber-500 px-4 py-1.5 font-display text-xs font-bold text-[#09080c] shadow-[0_4px_14px_rgba(245,158,11,0.4)] hover:bg-amber-400 cursor-pointer whitespace-nowrap"
                  >
                    🩸 Войти в Blood Castle ({player.bloodCastleTickets} бил.)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Chaos Wings Synthesis (Tier 2 -> Tier 3) */}
          <div className="rounded-xl bg-[#16121f] p-4 border border-amber-500/30">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-base font-bold text-[#fdf8ed]">
                  {hasWings
                    ? 'Эволюция в Крылья 3-го Уровня (Wings of Storm / Eternal / Illusion III)'
                    : 'Синтез Крыльев 2-го Уровня (Wings of Satan / Heaven / Elf II)'}
                </h3>
                <p className="mt-1 text-xs text-[#bfb6a6]">
                  {hasWings
                    ? 'Превращает ваши текущие крылья в Древние Крылья 3-го уровня (+42 АТК, +36 ЗАЩ, +32 Скорость, золотая молниеносная аура).'
                    : 'Дарует герою светящиеся крылья за спиной (+26 АТК, +22 ЗАЩ, +24 Скорость, +95 ОЗ) и частицу Древнего Сета.'}
                </p>
                <p className="mt-1.5 text-xs font-mono-num text-amber-300">
                  Требуется: 1 Jewel of Chaos (падает с Боссов с шансом 20%, с мобов в 150+ локациях и за квест Blood Castle) · 800 Zen · Шанс: 100%
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const msg = onCraftWings();
                  setCraftMessage(msg);
                }}
                className="min-h-[48px] rounded-xl bg-amber-500 px-5 py-2.5 font-display text-xs font-bold text-[#09080c] shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:bg-amber-400 cursor-pointer whitespace-nowrap shrink-0"
              >
                {hasWings ? 'Сковать Крылья 3-го Ур.' : 'Сковать Крылья Хаоса'}
              </button>
            </div>
          </div>

          {/* Section 2: Jewel of Bless, Soul & Life Item Upgrading */}
          <div>
            <h3 className="mb-3 text-xs font-semibold text-amber-300">
              Заточка надетой экипировки (+1..+15) и опции Jewel of Life (+4..+28)
            </h3>
            <div className="flex flex-col gap-3">
              {equippedList.map(({ item }) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-xl bg-[#14111c] p-3.5 border border-white/10 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="text-sm font-bold text-amber-300">
                      {item.name} +{item.level}{' '}
                      {item.lifeOption > 0 && (
                        <span className="text-emerald-300">(Life +{item.lifeOption})</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-[#cfc6b8] font-mono-num">
                      {item.baseAttack > 0 && `Эффективная АТК: ${calculateItemEffectiveAttack(item)} `}
                      {item.baseDefense > 0 && `Эффективная ЗАЩ: ${calculateItemEffectiveDefense(item)}`}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = onUpgradeWithJewel(item.id, 'bless');
                        setCraftMessage(msg);
                      }}
                      className="gothic-button min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold text-amber-200 cursor-pointer whitespace-nowrap"
                    >
                      +Bless ({player.jewels.bless})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = onUpgradeWithJewel(item.id, 'soul');
                        setCraftMessage(msg);
                      }}
                      className="gothic-button min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold text-purple-200 cursor-pointer whitespace-nowrap"
                    >
                      +Soul ({player.jewels.soul})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = onUpgradeWithJewel(item.id, 'life');
                        setCraftMessage(msg);
                      }}
                      className="gothic-button min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold text-emerald-300 cursor-pointer whitespace-nowrap"
                    >
                      +Life ({player.jewels.life})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
