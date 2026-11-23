import React, { useState } from 'react';
import {
  CLASSES,
  getShopEquipmentCatalog,
  ShopEquipmentCatalogEntry,
} from '../game/rules';
import {
  EquipmentItem,
  ItemRarity,
  ItemSlot,
  PlayerProgressState,
  SkillDefinition,
} from '../game/types';
import {
  CrossModalDragPayload,
  HoverTooltipState,
  ItemHoverTooltip,
} from './ItemHoverTooltip';

interface CityShopModalProps {
  player: PlayerProgressState;
  isNearShop: boolean;
  activeDragPayload: CrossModalDragPayload | null;
  onSetDragPayload: (payload: CrossModalDragPayload | null) => void;
  onSellInventoryItem: (item: EquipmentItem) => void;
  onClose: () => void;
}

const SLOT_LABELS: Record<ItemSlot, string> = {
  helm: 'Шлем',
  wings: 'Крылья',
  weapon: 'Оружие',
  armor: 'Доспех',
  ring: 'Кольцо',
  pendant: 'Амулет',
};

function getRarityBorderClass(rarity?: ItemRarity): string {
  if (rarity === 'ancient') {
    return 'border-amber-400 bg-gradient-to-br from-amber-500/20 via-emerald-500/15 to-[#14111d]';
  }
  if (rarity === 'excellent') {
    return 'border-emerald-400/80 bg-gradient-to-br from-emerald-500/20 to-[#14111d]';
  }
  if (rarity === 'magic') {
    return 'border-sky-400/75 bg-gradient-to-br from-sky-500/20 to-[#14111d]';
  }
  return 'border-amber-500/35 bg-[#181424]';
}

function getRarityTextClass(rarity?: ItemRarity): string {
  if (rarity === 'ancient') return 'text-amber-300';
  if (rarity === 'excellent') return 'text-emerald-300';
  if (rarity === 'magic') return 'text-sky-300';
  return 'text-[#fdf8ed]';
}

const ShopSlotSvgIcon: React.FC<{ slot: ItemSlot; rarity?: ItemRarity }> = ({
  slot,
  rarity,
}) => {
  const strokeColor =
    rarity === 'ancient'
      ? '#fbbf24'
      : rarity === 'excellent'
        ? '#34d399'
        : rarity === 'magic'
          ? '#38bdf8'
          : '#d4a853';

  if (slot === 'weapon') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path
          d="M25 4 L28 7 L13 22 L9 22 L9 18 Z"
          fill={strokeColor}
          fillOpacity="0.3"
          stroke={strokeColor}
          strokeWidth="2"
        />
        <path d="M7 16 L16 25 M5 27 L10 22" stroke="#fde047" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (slot === 'armor') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path
          d="M10 5 L16 8 L22 5 L27 10 L24 15 L22 14 L22 27 L10 27 L10 14 L8 15 L5 10 Z"
          fill={strokeColor}
          fillOpacity="0.3"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M16 9 L16 25" stroke="#fde047" strokeWidth="1.6" />
      </svg>
    );
  }
  if (slot === 'helm') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path
          d="M6 9 L10 13 M26 9 L22 13"
          stroke="#fde047"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M9 15 C9 10 23 10 23 15 L23 25 L18 23 L16 26 L14 23 L9 25 Z"
          fill={strokeColor}
          fillOpacity="0.3"
          stroke={strokeColor}
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <circle cx="16" cy="18" r="8" fill="none" stroke={strokeColor} strokeWidth="2.6" />
      <polygon points="16,6 20,10 16,13 12,10" fill="#fde047" />
    </svg>
  );
};

export const CityShopModal: React.FC<CityShopModalProps> = ({
  player,
  isNearShop,
  activeDragPayload,
  onSetDragPayload,
  onSellInventoryItem,
  onClose,
}) => {
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltipState | null>(null);
  const [shopNotice, setShopNotice] = useState<string>(
    'Перетащите вещь, книгу скила или банки мышкой в сетку Инвентаря [V] справа, чтобы купить!'
  );

  const cls = CLASSES[player.classId];
  const equipmentCatalog = getShopEquipmentCatalog(player.classId);

  const beginDrag = (payload: CrossModalDragPayload, e: React.DragEvent) => {
    setHoverTooltip(null);
    onSetDragPayload(payload);
    try {
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'copyMove';
    } catch {
      // Fallback handled via shared activeDragPayload state
    }
  };

  const handleDropToSell = (e: React.DragEvent) => {
    e.preventDefault();
    let payload: CrossModalDragPayload | null = activeDragPayload;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) payload = JSON.parse(raw) as CrossModalDragPayload;
      } catch {
        payload = null;
      }
    }
    if (payload && payload.source === 'inventory') {
      const item = player.inventory.find((i) => i.id === payload.itemId);
      if (item) {
        onSellInventoryItem(item);
        setShopNotice(`Продано торговцу Ханзо: ${item.name} за +${item.valueZen} Zen!`);
      }
    }
    onSetDragPayload(null);
  };

  const handleEquipmentMouseEnter = (
    entry: ShopEquipmentCatalogEntry,
    e: React.MouseEvent
  ) => {
    setHoverTooltip({
      target: {
        kind: 'equipment',
        item: entry.itemTemplate,
        context: 'shop',
        requiredLevel: entry.requiredLevel,
        priceZen: entry.priceZen,
      },
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const handleSkillBookMouseEnter = (skill: SkillDefinition, e: React.MouseEvent) => {
    setHoverTooltip({
      target: {
        kind: 'skill_book',
        skill,
        isLearned: player.learnedSkills.includes(skill.id),
        playerLevel: player.level,
        playerTier: player.classTier,
        playerZen: player.zen,
      },
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const handlePotionMouseEnter = (
    potionType: 'hp' | 'mp',
    packSize: 5 | 20,
    priceZen: number,
    e: React.MouseEvent
  ) => {
    setHoverTooltip({
      target: {
        kind: 'potion',
        potionType,
        count: packSize,
        context: 'shop',
        priceZen,
      },
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const updateTooltipCoords = (e: React.MouseEvent) => {
    setHoverTooltip((prev) =>
      prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : null
    );
  };

  return (
    <>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropToSell}
        className="pointer-events-auto fixed left-2.5 top-16 z-40 flex max-h-[82vh] w-[calc(100vw-20px)] max-w-[465px] flex-col overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-[#110e19]/96 shadow-[0_16px_48px_rgba(0,0,0,0.94)] sm:left-5 sm:top-20"
        role="dialog"
        aria-modal="false"
        aria-label="Городская Лавка Торговца Ханзо"
      >
        {/* Shop Window Header */}
        <div className="flex items-center justify-between border-b border-amber-500/25 bg-[#181325] px-3.5 py-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-amber-400/60 bg-amber-500/20 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-amber-300">
                🏪 МАГАЗИН
              </span>
              <h2 className="truncate font-display text-sm font-bold text-[#fdf8ed] sm:text-base">
                Лавка Кузнеца и Мага Ханзо
              </h2>
            </div>
            <p className="mt-0.5 font-mono-num text-[11px] text-emerald-300">
              {isNearShop
                ? `🟢 Вы у прилавка в городе · Ваше золото: ${player.zen} Zen`
                : '🔴 Вы отошли от прилавка! Подойдите к Ханзо в городе'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть магазин"
            className="gothic-button min-h-[36px] min-w-[36px] rounded-xl px-2.5 py-1 text-xs font-bold text-amber-200 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Instruction Banner */}
        <div className="border-b border-amber-500/25 bg-[#1c162b] px-3.5 py-1.5 text-[11px] font-medium text-amber-200">
          ⇄ {shopNotice}
        </div>

        {/* Scrollable Shop Shelves */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3.5">
          {/* 1. SKILL BOOKS SHELF (Drag into Inventory [V] to buy & learn) */}
          <div className="rounded-xl border border-amber-500/30 bg-[#151120] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                📚 Книги и Свитки Навыков (перетащите в Инвентарь [V])
              </span>
              <span className="font-mono-num text-[11px] text-emerald-300">
                Изучено: {player.learnedSkills.length}/{cls.skills.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {cls.skills.map((skill) => {
                const isLearned = player.learnedSkills.includes(skill.id);
                const meetsLevel = player.level >= skill.requiredLevel;
                const meetsTier = (skill.requiredTier ?? 1) <= player.classTier;
                const canAfford = player.zen >= skill.bookPriceZen;
                const canBuy = !isLearned && meetsLevel && meetsTier && canAfford;

                return (
                  <div
                    key={skill.id}
                    draggable={!isLearned}
                    onDragStart={(e) =>
                      beginDrag({ source: 'shop_skill_book', skillId: skill.id }, e)
                    }
                    onDragEnd={() => onSetDragPayload(null)}
                    onMouseEnter={(e) => handleSkillBookMouseEnter(skill, e)}
                    onMouseMove={updateTooltipCoords}
                    onMouseLeave={() => setHoverTooltip(null)}
                    data-testid={`shop-skill-book-${skill.id}`}
                    className={`relative flex flex-col justify-between rounded-xl border p-2.5 select-none transition-colors ${
                      isLearned
                        ? 'border-emerald-500/40 bg-emerald-950/25 opacity-75 cursor-default'
                        : canBuy
                          ? 'border-amber-400/80 bg-[#211a30] hover:border-amber-300 cursor-grab active:cursor-grabbing shadow-[0_0_12px_rgba(245,158,11,0.18)]'
                          : 'border-white/15 bg-[#120f1c] hover:border-amber-500/50 cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: skill.color }}
                        />
                        <span className="truncate text-[11px] font-bold text-[#fdf8ed]">
                          {skill.bookName}
                        </span>
                      </div>
                      <span className="shrink-0 rounded bg-black/75 px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-amber-300">
                        [{skill.keyBinding}]
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between font-mono-num text-[10px]">
                      <span
                        className={
                          meetsLevel && meetsTier ? 'text-emerald-300' : 'text-rose-300'
                        }
                      >
                        Треб. Ур.{skill.requiredLevel}
                        {(skill.requiredTier ?? 1) > 1 ? '·1Пр' : ''}
                      </span>
                      <span
                        className={`font-extrabold ${
                          isLearned
                            ? 'text-emerald-300'
                            : canAfford
                              ? 'text-amber-300'
                              : 'text-rose-400'
                        }`}
                      >
                        {isLearned ? '✅ Изучено' : `${skill.bookPriceZen} Zen`}
                      </span>
                    </div>

                    {!isLearned && (
                      <div className="mt-1 text-[9px] font-semibold text-amber-200/85">
                        ⇄ Перетащите в Инвентарь [V]
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. EQUIPMENT SHELF (Drag into Inventory [V] to buy) */}
          <div className="rounded-xl border border-amber-500/30 bg-[#151120] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                ⚔️ Оружие и Доспехи (перетащите в Инвентарь [V])
              </span>
              <span className="text-[10px] text-[#b5ab9b]">
                Наведите мышь для статов
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {equipmentCatalog.map((entry) => {
                const { itemTemplate } = entry;
                const meetsLevel = player.level >= entry.requiredLevel;
                const canAfford = player.zen >= entry.priceZen;

                return (
                  <div
                    key={entry.catalogId}
                    draggable
                    onDragStart={(e) =>
                      beginDrag(
                        { source: 'shop_equipment', catalogId: entry.catalogId },
                        e
                      )
                    }
                    onDragEnd={() => onSetDragPayload(null)}
                    onMouseEnter={(e) => handleEquipmentMouseEnter(entry, e)}
                    onMouseMove={updateTooltipCoords}
                    onMouseLeave={() => setHoverTooltip(null)}
                    data-testid={`shop-item-${entry.catalogId}`}
                    className={`relative flex flex-col items-center justify-between rounded-xl border p-2 select-none cursor-grab active:cursor-grabbing transition-colors ${getRarityBorderClass(
                      itemTemplate.rarity
                    )} hover:border-amber-300`}
                  >
                    <div className="flex w-full items-center justify-between font-mono-num text-[9px]">
                      <span
                        className={
                          meetsLevel ? 'text-emerald-300 font-bold' : 'text-rose-400 font-bold'
                        }
                      >
                        Ур.{entry.requiredLevel}
                      </span>
                      {itemTemplate.level > 0 && (
                        <span className="rounded bg-black/80 px-1 font-extrabold text-amber-300">
                          +{itemTemplate.level}
                        </span>
                      )}
                    </div>

                    <div className="my-1">
                      <ShopSlotSvgIcon
                        slot={itemTemplate.slot}
                        rarity={itemTemplate.rarity}
                      />
                    </div>

                    <div
                      className={`w-full truncate text-center text-[10px] font-bold ${getRarityTextClass(
                        itemTemplate.rarity
                      )}`}
                    >
                      {itemTemplate.name}
                    </div>

                    <div className="text-[9px] text-[#bfb5a4]">
                      {SLOT_LABELS[itemTemplate.slot]}
                    </div>

                    <div
                      className={`mt-1 w-full rounded bg-black/70 py-0.5 text-center font-mono-num text-[10px] font-extrabold ${
                        canAfford ? 'text-amber-300' : 'text-rose-400'
                      }`}
                    >
                      {entry.priceZen} Zen
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. POTIONS SHELF (Drag into Inventory [V] to buy) */}
          <div className="rounded-xl border border-amber-500/30 bg-[#151120] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                🧪 Зелья ОЗ и Маны (перетащите в Инвентарь [V])
              </span>
              <span className="font-mono-num text-[10px] text-[#bfb5a4]">
                Запас: ОЗ🧪{player.hpPotions} · МН💧{player.mpPotions}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { type: 'hp' as const, pack: 5 as const, price: 250, label: '+5 ОЗ' },
                  { type: 'hp' as const, pack: 20 as const, price: 900, label: '+20 ОЗ' },
                  { type: 'mp' as const, pack: 5 as const, price: 200, label: '+5 МН' },
                  { type: 'mp' as const, pack: 20 as const, price: 750, label: '+20 МН' },
                ]
              ).map((p) => {
                const canAfford = player.zen >= p.price;
                return (
                  <div
                    key={`${p.type}_${p.pack}`}
                    draggable
                    onDragStart={(e) =>
                      beginDrag(
                        {
                          source: 'shop_potion',
                          potionType: p.type,
                          packSize: p.pack,
                        },
                        e
                      )
                    }
                    onDragEnd={() => onSetDragPayload(null)}
                    onMouseEnter={(e) =>
                      handlePotionMouseEnter(p.type, p.pack, p.price, e)
                    }
                    onMouseMove={updateTooltipCoords}
                    onMouseLeave={() => setHoverTooltip(null)}
                    data-testid={`shop-potion-${p.type}-${p.pack}`}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2 select-none cursor-grab active:cursor-grabbing ${
                      p.type === 'hp'
                        ? 'border-rose-500/45 bg-[#1e121a] hover:border-rose-300'
                        : 'border-sky-500/45 bg-[#111a26] hover:border-sky-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#fdf8ed]">
                      {p.type === 'hp' ? '🧪' : '💧'} {p.label}
                    </span>
                    <span
                      className={`mt-1 font-mono-num text-[10px] font-extrabold ${
                        canAfford ? 'text-amber-300' : 'text-rose-400'
                      }`}
                    >
                      {p.price} Zen
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. SELL DROP ZONE */}
          <div className="rounded-xl border border-dashed border-amber-500/35 bg-[#14101d] px-3 py-2 text-center text-[11px] text-[#bfb5a4]">
            💰 Перетащите ненужную экипировку из сетки Инвентаря [V] в это окно Магазина, чтобы продать её за Zen
          </div>
        </div>
      </div>

      <ItemHoverTooltip tooltip={hoverTooltip} />
    </>
  );
};
