import React, { useMemo, useState } from 'react';
import {
  calculateItemEffectiveAttack,
  calculateItemEffectiveDefense,
} from '../game/rules';
import {
  EquipmentItem,
  ItemRarity,
  ItemSlot,
  PlayerProgressState,
  PlayerTradeSession,
  TradeJewelOffer,
  TradeSideOffer,
} from '../game/types';

interface PlayerTradeModalProps {
  player: PlayerProgressState;
  selfId: string;
  session: PlayerTradeSession;
  onRespondTrade: (tradeId: string, accept: boolean) => void;
  onUpdateOffer: (tradeId: string, offer: TradeSideOffer) => void;
  onCancelTrade: (tradeId: string) => void;
}

const SLOT_LABELS: Record<ItemSlot, string> = {
  helm: 'Шлем',
  wings: 'Крылья',
  weapon: 'Оружие',
  armor: 'Доспех',
  ring: 'Кольцо',
  pendant: 'Амулет',
};

function getRarityTextClass(rarity?: ItemRarity): string {
  if (rarity === 'ancient') return 'text-amber-300';
  if (rarity === 'excellent') return 'text-emerald-300';
  if (rarity === 'magic') return 'text-sky-300';
  return 'text-[#f3efe6]';
}

function getRarityBorderClass(rarity?: ItemRarity): string {
  if (rarity === 'ancient') {
    return 'border-amber-400 bg-amber-500/20';
  }
  if (rarity === 'excellent') {
    return 'border-emerald-400/80 bg-emerald-500/20';
  }
  if (rarity === 'magic') {
    return 'border-sky-400/75 bg-sky-500/20';
  }
  return 'border-white/20 bg-[#171321]';
}

export const PlayerTradeModal: React.FC<PlayerTradeModalProps> = ({
  player,
  selfId,
  session,
  onRespondTrade,
  onUpdateOffer,
  onCancelTrade,
}) => {
  const isInitiator = session.initiatorId === selfId;
  const partnerId = isInitiator ? session.targetId : session.initiatorId;
  const partnerNickname = isInitiator ? session.targetNickname : session.initiatorNickname;

  const myOffer: TradeSideOffer = useMemo(
    () =>
      session.offers[selfId] ?? {
        zen: 0,
        items: [],
        jewels: { bless: 0, soul: 0, life: 0, chaos: 0 },
        locked: false,
      },
    [session.offers, selfId]
  );

  const partnerOffer: TradeSideOffer = useMemo(
    () =>
      session.offers[partnerId] ?? {
        zen: 0,
        items: [],
        jewels: { bless: 0, soul: 0, life: 0, chaos: 0 },
        locked: false,
      },
    [session.offers, partnerId]
  );

  const [zenInput, setZenInput] = useState<string>(String(myOffer.zen || ''));

  const emitNextOffer = (patch: Partial<TradeSideOffer>) => {
    const next: TradeSideOffer = {
      zen: patch.zen ?? myOffer.zen,
      items: patch.items ?? myOffer.items,
      jewels: patch.jewels ?? myOffer.jewels,
      locked: patch.locked ?? false,
    };
    onUpdateOffer(session.tradeId, next);
  };

  const handleToggleItemInOffer = (item: EquipmentItem) => {
    const exists = myOffer.items.some((i) => i.id === item.id);
    const nextItems = exists
      ? myOffer.items.filter((i) => i.id !== item.id)
      : myOffer.items.length < 8
        ? [...myOffer.items, item]
        : myOffer.items;
    emitNextOffer({ items: nextItems, locked: false });
  };

  const handleAdjustJewel = (jewel: keyof TradeJewelOffer, delta: number) => {
    const maxOwned = player.jewels[jewel];
    const curr = myOffer.jewels[jewel];
    const nextCount = Math.max(0, Math.min(maxOwned, curr + delta));
    if (nextCount === curr) return;
    emitNextOffer({
      jewels: { ...myOffer.jewels, [jewel]: nextCount },
      locked: false,
    });
  };

  const handleApplyZen = (rawVal: string) => {
    setZenInput(rawVal);
    const parsed = Math.max(0, Math.min(player.zen, Math.floor(Number(rawVal) || 0)));
    emitNextOffer({ zen: parsed, locked: false });
  };

  if (session.status === 'pending') {
    return (
      <div
        className="pointer-events-auto fixed left-1/2 top-20 z-50 w-[calc(100vw-24px)] max-w-[430px] -translate-x-1/2 rounded-2xl border-2 border-amber-400/80 bg-[#120e1c]/98 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.96)]"
        role="dialog"
        aria-modal="false"
        aria-label="Запрос на Трейд между игроками"
      >
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 font-mono-num text-[11px] font-extrabold text-amber-300">
              ⚖️ ТРЕЙД НА ЛОКАЦИИ
            </span>
            <h3 className="font-display text-sm font-bold text-[#fdf8ed]">
              {isInitiator ? 'Ожидание ответа...' : `Обмен от ${partnerNickname}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onCancelTrade(session.tradeId)}
            aria-label="Отменить запрос трейда"
            className="gothic-button rounded-lg px-2 py-1 text-xs font-bold text-rose-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[#e6dec8]">
          {isInitiator ? (
            <>
              Вы отправили запрос на обмен игроку{' '}
              <span className="font-bold text-emerald-300">{partnerNickname}</span>. Ожидаем
              подтверждения...
            </>
          ) : (
            <>
              Игрок <span className="font-bold text-emerald-300">{partnerNickname}</span> на вашей
              локации предлагает вам обмен вещами, камнями и Zen!
            </>
          )}
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          {!isInitiator && (
            <button
              type="button"
              onClick={() => onRespondTrade(session.tradeId, true)}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-display text-xs font-extrabold text-[#09080c] hover:bg-emerald-400 cursor-pointer"
            >
              ✓ Принять Трейд
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              isInitiator
                ? onCancelTrade(session.tradeId)
                : onRespondTrade(session.tradeId, false)
            }
            className="gothic-button rounded-xl border-rose-500/50 px-3.5 py-2 text-xs font-bold text-rose-300 cursor-pointer"
          >
            Отклонить
          </button>
        </div>
      </div>
    );
  }

  const offeredIds = new Set(myOffer.items.map((i) => i.id));

  return (
    <div
      className="pointer-events-auto fixed left-1/2 top-14 z-50 flex max-h-[84vh] w-[calc(100vw-20px)] max-w-[680px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border-2 border-amber-400/75 bg-[#100d18]/98 shadow-[0_22px_60px_rgba(0,0,0,0.96)]"
      role="dialog"
      aria-modal="false"
      aria-label={`Окно Трейда с игроком ${partnerNickname}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 bg-[#171222] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-amber-400/60 bg-amber-500/20 px-2 py-0.5 font-mono-num text-[11px] font-extrabold text-amber-300">
            ⚖️ ОБМЕН ИГРОКОВ
          </span>
          <h2 className="font-display text-sm font-bold text-[#fdf8ed] sm:text-base">
            Вы ⇄ {partnerNickname}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onCancelTrade(session.tradeId)}
          aria-label="Отменить и закрыть трейд"
          className="gothic-button rounded-xl border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-200 cursor-pointer"
        >
          ✕ Отменить Трейд
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* PARTNER OFFER PANEL */}
          <div className="flex flex-col justify-between rounded-xl border border-emerald-500/35 bg-[#131920] p-3">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="font-display text-xs font-bold text-emerald-300">
                  🤝 Предложение {partnerNickname}
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-mono-num text-[10px] font-extrabold ${
                    partnerOffer.locked
                      ? 'bg-emerald-500 text-[#09080c]'
                      : 'bg-white/10 text-[#b5ab9b]'
                  }`}
                >
                  {partnerOffer.locked ? '✓ ГОТОВ К ОБМЕНУ' : 'Выбирает вещи...'}
                </span>
              </div>

              {/* Partner Zen & Jewels */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 rounded-lg bg-black/35 px-2.5 py-1.5 font-mono-num text-xs">
                <span className="font-bold text-amber-300">🪙 {partnerOffer.zen} Zen</span>
                <span className="text-[11px] text-purple-200">
                  💎 B:{partnerOffer.jewels.bless} · S:{partnerOffer.jewels.soul} · L:
                  {partnerOffer.jewels.life} · C:{partnerOffer.jewels.chaos}
                </span>
              </div>

              {/* Partner Items */}
              <div className="mt-2 flex flex-col gap-1.5">
                {partnerOffer.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/15 py-4 text-center text-[11px] italic text-[#8a8070]">
                    Предметы не добавлены
                  </div>
                ) : (
                  partnerOffer.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${getRarityBorderClass(
                        item.rarity
                      )}`}
                    >
                      <div className="min-w-0">
                        <div
                          className={`truncate text-xs font-bold ${getRarityTextClass(
                            item.rarity
                          )}`}
                        >
                          {item.name} +{item.level}
                        </div>
                        <div className="font-mono-num text-[10px] text-[#cfc6b8]">
                          {SLOT_LABELS[item.slot]} ·{' '}
                          {item.baseAttack > 0 && `АТК ${calculateItemEffectiveAttack(item)} `}
                          {item.baseDefense > 0 && `ЗАЩ ${calculateItemEffectiveDefense(item)}`}
                          {item.lifeOption > 0 && ` · Life +${item.lifeOption}`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* YOUR OFFER PANEL */}
          <div className="flex flex-col justify-between rounded-xl border border-amber-500/40 bg-[#171223] p-3">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="font-display text-xs font-bold text-amber-300">
                  🎒 Ваше Предложение
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-mono-num text-[10px] font-extrabold ${
                    myOffer.locked
                      ? 'bg-amber-400 text-[#09080c]'
                      : 'bg-white/10 text-[#b5ab9b]'
                  }`}
                >
                  {myOffer.locked ? '✓ ПОДТВЕРЖДЕНО' : 'Редактирование'}
                </span>
              </div>

              {/* Your Zen Input */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <label
                  htmlFor="trade-zen-input"
                  className="font-mono-num text-[11px] text-[#dfd7c8]"
                >
                  Золото Zen (макс. {player.zen}):
                </label>
                <input
                  id="trade-zen-input"
                  type="number"
                  min={0}
                  max={player.zen}
                  value={zenInput}
                  onChange={(e) => handleApplyZen(e.target.value)}
                  placeholder="0"
                  className="w-28 rounded-lg border border-amber-500/40 bg-[#0d0a14] px-2 py-1 font-mono-num text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Your Jewels Selector */}
              <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono-num text-[10px]">
                {(
                  [
                    { key: 'bless', label: 'Bless', max: player.jewels.bless },
                    { key: 'soul', label: 'Soul', max: player.jewels.soul },
                    { key: 'life', label: 'Life', max: player.jewels.life },
                    { key: 'chaos', label: 'Chaos', max: player.jewels.chaos },
                  ] as const
                ).map((j) => (
                  <div
                    key={j.key}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-black/35 px-2 py-1"
                  >
                    <span className="text-amber-200">
                      {j.label}: <b>{myOffer.jewels[j.key]}</b>/{j.max}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustJewel(j.key, -1)}
                        disabled={myOffer.jewels[j.key] <= 0}
                        aria-label={`Убрать 1 ${j.label} из трейда`}
                        className="rounded bg-white/10 px-1.5 py-0.5 font-bold text-white hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustJewel(j.key, 1)}
                        disabled={myOffer.jewels[j.key] >= j.max}
                        aria-label={`Добавить 1 ${j.label} в трейд`}
                        className="rounded bg-amber-500/30 px-1.5 py-0.5 font-bold text-amber-200 hover:bg-amber-500/50 disabled:opacity-30 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Your Selected Items */}
              <div className="mt-2 flex flex-col gap-1">
                {myOffer.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/15 py-3 text-center text-[11px] italic text-[#8a8070]">
                    Кликните по вещам из вашей сумки ниже, чтобы добавить в трейд
                  </div>
                ) : (
                  myOffer.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItemInOffer(item)}
                      role="button"
                      tabIndex={0}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1 cursor-pointer ${getRarityBorderClass(
                        item.rarity
                      )}`}
                    >
                      <span
                        className={`truncate text-xs font-bold ${getRarityTextClass(
                          item.rarity
                        )}`}
                      >
                        {item.name} +{item.level}
                      </span>
                      <span className="text-[10px] font-bold text-rose-300">Убрать ×</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* YOUR BAG ITEMS PICKER */}
        <div className="rounded-xl border border-amber-500/25 bg-[#13101d] p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">
              Сумка Инвентаря (Кликните на предмет, чтобы добавить/убрать из обмена):
            </span>
            <span className="font-mono-num text-[11px] text-[#b5ab9b]">
              Выбрано: {myOffer.items.length}/8
            </span>
          </div>
          {player.inventory.length === 0 ? (
            <div className="py-2 text-center text-xs italic text-[#7c7365]">
              В вашей сумке сейчас нет свободной экипировки (снимите вещь с героя в окне [V], чтобы
              передать её).
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {player.inventory.map((item) => {
                const isOffered = offeredIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleItemInOffer(item)}
                    className={`flex flex-col items-start rounded-lg border p-2 text-left transition-all cursor-pointer ${getRarityBorderClass(
                      item.rarity
                    )} ${
                      isOffered
                        ? 'ring-2 ring-emerald-400 opacity-95'
                        : 'hover:border-amber-300'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span
                        className={`truncate text-[11px] font-bold ${getRarityTextClass(
                          item.rarity
                        )}`}
                      >
                        {item.name}
                      </span>
                      <span className="rounded bg-black/70 px-1 font-mono-num text-[10px] font-extrabold text-amber-300">
                        +{item.level}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono-num text-[10px] text-[#cfc6b8]">
                      {SLOT_LABELS[item.slot]} ·{' '}
                      {isOffered ? '✓ В трейде' : 'Нажмите для трейда'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Lock & Confirm Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-500/30 bg-[#171222] px-4 py-2.5">
        <span className="text-[11px] text-[#cfc6b8]">
          Обмен завершится мгновенно, когда оба игрока нажмут «Подтвердить обмен».
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => emitNextOffer({ locked: !myOffer.locked })}
            className={`rounded-xl px-4 py-2 font-display text-xs font-extrabold cursor-pointer ${
              myOffer.locked
                ? 'bg-amber-400 text-[#09080c] shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                : 'bg-emerald-500 text-[#09080c] hover:bg-emerald-400'
            }`}
          >
            {myOffer.locked ? '🔒 Ожидание второго игрока (Нажмите для отмены)' : '✓ Подтвердить обмен'}
          </button>
        </div>
      </div>
    </div>
  );
};
