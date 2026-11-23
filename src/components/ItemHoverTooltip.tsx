import React from 'react';
import {
  calculateItemEffectiveAttack,
  calculateItemEffectiveDefense,
} from '../game/rules';
import {
  EquipmentItem,
  ItemRarity,
  ItemSlot,
  SkillDefinition,
} from '../game/types';

export type CrossModalDragPayload =
  | { source: 'inventory'; itemId: string }
  | { source: 'equipped'; slot: ItemSlot }
  | { source: 'jewel'; jewel: 'bless' | 'soul' | 'life' }
  | { source: 'shop_equipment'; catalogId: string }
  | { source: 'shop_skill_book'; skillId: string }
  | { source: 'shop_potion'; potionType: 'hp' | 'mp'; packSize: 5 | 20 };

export type HoverTooltipTarget =
  | {
      kind: 'equipment';
      item: EquipmentItem;
      context: 'inventory' | 'equipped' | 'shop';
      requiredLevel?: number;
      priceZen?: number;
    }
  | {
      kind: 'skill_book';
      skill: SkillDefinition;
      isLearned: boolean;
      playerLevel: number;
      playerTier: number;
      playerZen: number;
    }
  | {
      kind: 'jewel';
      jewel: 'bless' | 'soul' | 'life' | 'chaos';
      label: string;
      count: number;
      desc: string;
    }
  | {
      kind: 'potion';
      potionType: 'hp' | 'mp';
      count: number;
      context: 'inventory' | 'shop';
      priceZen?: number;
    }
  | {
      kind: 'quest_item';
      name: string;
      hasItem: boolean;
    };

export interface HoverTooltipState {
  target: HoverTooltipTarget;
  clientX: number;
  clientY: number;
}

const SLOT_LABELS: Record<ItemSlot, string> = {
  helm: 'Шлем',
  wings: 'Крылья',
  weapon: 'Оружие',
  armor: 'Доспех',
  ring: 'Кольцо',
  pendant: 'Амулет',
};

const RARITY_LABELS: Record<ItemRarity, string> = {
  normal: 'Обычный (Normal)',
  magic: 'Магический (Magic)',
  excellent: 'Превосходный (Excellent)',
  ancient: 'Древний Сет (Ancient)',
};

function getRarityTitleColor(rarity: ItemRarity): string {
  if (rarity === 'ancient') return 'text-amber-300';
  if (rarity === 'excellent') return 'text-emerald-300';
  if (rarity === 'magic') return 'text-sky-300';
  return 'text-[#fdf8ed]';
}

function getRarityBadgeClass(rarity: ItemRarity): string {
  if (rarity === 'ancient') {
    return 'border-amber-400/70 bg-amber-500/20 text-amber-200';
  }
  if (rarity === 'excellent') {
    return 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200';
  }
  if (rarity === 'magic') {
    return 'border-sky-400/70 bg-sky-500/20 text-sky-200';
  }
  return 'border-white/20 bg-white/10 text-[#d6cec2]';
}

export const ItemHoverTooltip: React.FC<{
  tooltip: HoverTooltipState | null;
}> = ({ tooltip }) => {
  if (!tooltip) return null;

  const { target, clientX, clientY } = tooltip;

  // Position tooltip window safely inside the viewport near the mouse cursor
  const tooltipWidth = 300;
  const tooltipHeight = 250;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  let left = clientX + 18;
  if (left + tooltipWidth > vw - 12) {
    left = Math.max(12, clientX - tooltipWidth - 18);
  }
  let top = clientY - 16;
  if (top + tooltipHeight > vh - 12) {
    top = Math.max(12, vh - tooltipHeight - 16);
  }
  if (top < 12) top = 12;

  return (
    <div
      style={{ left: `${left}px`, top: `${top}px` }}
      role="tooltip"
      data-testid="item-hover-tooltip"
      className="pointer-events-none fixed z-[80] w-[295px] rounded-xl border-2 border-amber-400/90 bg-[#0b0913]/98 p-3 text-left shadow-[0_16px_44px_rgba(0,0,0,0.96)]"
    >
      {target.kind === 'equipment' && (
        <div className="flex flex-col gap-1.5">
          <div className="border-b border-amber-500/30 pb-1.5">
            <div
              className={`font-display text-sm font-extrabold leading-snug ${getRarityTitleColor(
                target.item.rarity
              )}`}
            >
              {target.item.name}
              {target.item.level > 0 ? ` +${target.item.level}` : ''}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-[#e6dec8]">
                Слот: {SLOT_LABELS[target.item.slot]}
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${getRarityBadgeClass(
                  target.item.rarity
                )}`}
              >
                {RARITY_LABELS[target.item.rarity]}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 font-mono-num text-xs text-[#e6dec8]">
            {target.requiredLevel !== undefined && (
              <div className="flex items-center justify-between text-amber-200">
                <span>Требуемый уровень:</span>
                <span className="font-bold">Ур. {target.requiredLevel}</span>
              </div>
            )}
            {target.item.baseAttack > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[#b5ab9b]">Физич. / Маг. атака:</span>
                <span className="font-bold text-amber-300">
                  {calculateItemEffectiveAttack(target.item)} (база {target.item.baseAttack})
                </span>
              </div>
            )}
            {target.item.baseDefense > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[#b5ab9b]">Защита брони:</span>
                <span className="font-bold text-sky-300">
                  {calculateItemEffectiveDefense(target.item)} (база {target.item.baseDefense})
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#b5ab9b]">Шанс крит. удара:</span>
              <span className="font-bold text-emerald-300">
                +{target.item.critChanceBonus}%
              </span>
            </div>
            {target.item.moveSpeedBonus > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[#b5ab9b]">Скорость бега:</span>
                <span className="font-bold text-sky-200">
                  +{target.item.moveSpeedBonus}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#b5ab9b]">Уровень заточки:</span>
              <span className="font-bold text-amber-200">
                +{target.item.level} / +15
              </span>
            </div>
          </div>

          {target.item.lifeOption > 0 && (
            <div className="rounded-lg border border-sky-400/35 bg-sky-950/35 px-2 py-1 font-mono-num text-[11px] font-bold text-sky-300">
              ✦ Опция Jewel of Life: +{target.item.lifeOption} к боевой мощи
            </div>
          )}

          {target.item.excellentOption && (
            <div className="rounded-lg border border-emerald-400/35 bg-emerald-950/35 px-2 py-1 text-[11px] font-semibold text-emerald-300">
              ★ {target.item.excellentOption}
            </div>
          )}

          {target.item.setName && (
            <div className="text-[11px] font-semibold text-amber-300">
              Комплект: {target.item.setName}
            </div>
          )}

          <div className="mt-0.5 flex items-center justify-between border-t border-white/10 pt-1.5 font-mono-num text-[11px]">
            <span className="text-[#b5ab9b]">
              {target.context === 'shop' ? 'Цена в Лавке:' : 'Цена продажи:'}
            </span>
            <span className="font-extrabold text-amber-300">
              {target.priceZen ?? target.item.valueZen} Zen
            </span>
          </div>

          <div className="text-[10px] italic text-amber-200/85">
            {target.context === 'shop'
              ? 'Перетащите вещь мышкой в сетку Инвентаря [V] справа, чтобы купить!'
              : target.context === 'inventory'
                ? 'Двойной клик / ПКМ или перетащите на куклу — надеть'
                : 'Двойной клик / ПКМ или перетащите в сумку — снять'}
          </div>
        </div>
      )}

      {target.kind === 'skill_book' && (
        <div className="flex flex-col gap-1.5">
          <div className="border-b border-amber-500/30 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: target.skill.color }}
              />
              <span className="font-display text-sm font-extrabold text-amber-300">
                {target.skill.bookName}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-[#e6dec8]">
              Навык [{target.skill.keyBinding}]: {target.skill.name}
            </div>
            <div className="text-[10px] text-[#b5ab9b]">{target.skill.roleClue}</div>
          </div>

          <div className="flex flex-col gap-1 font-mono-num text-xs text-[#e6dec8]">
            <div className="flex items-center justify-between">
              <span className="text-[#b5ab9b]">Требуемый уровень:</span>
              <span
                className={`font-bold ${
                  target.playerLevel >= target.skill.requiredLevel
                    ? 'text-emerald-300'
                    : 'text-rose-400'
                }`}
              >
                Ур. {target.skill.requiredLevel} (Ваш: {target.playerLevel})
              </span>
            </div>
            {(target.skill.requiredTier ?? 1) > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-[#b5ab9b]">Требуемая профессия:</span>
                <span
                  className={`font-bold ${
                    target.playerTier >= (target.skill.requiredTier ?? 1)
                      ? 'text-emerald-300'
                      : 'text-rose-400'
                  }`}
                >
                  1-я Профессия (Себина 50 Ур.)
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#b5ab9b]">Множитель урона:</span>
              <span className="font-bold text-amber-300">
                ×{target.skill.damageMultiplier} ({Math.round(target.skill.damageMultiplier * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#b5ab9b]">Расход маны / КД:</span>
              <span className="font-bold text-sky-300">
                {target.skill.manaCost} МН · {target.skill.cooldownSec}с
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#b5ab9b]">Дальность / Радиус:</span>
              <span className="font-bold text-[#e6dec8]">
                {target.skill.range}px / {target.skill.aoeRadius}px
              </span>
            </div>
          </div>

          <div className="mt-0.5 flex items-center justify-between border-t border-white/10 pt-1.5 font-mono-num text-xs">
            <span className="text-[#b5ab9b]">Цена книги:</span>
            <span
              className={`font-extrabold ${
                target.playerZen >= target.skill.bookPriceZen
                  ? 'text-amber-300'
                  : 'text-rose-400'
              }`}
            >
              {target.skill.bookPriceZen} Zen
            </span>
          </div>

          <div className="text-[10px] italic text-amber-200/90">
            {target.isLearned
              ? '✅ Этот навык уже изучен вашим героем!'
              : 'Перетащите книгу мышкой в сетку Инвентаря [V] справа, чтобы купить и изучить скил!'}
          </div>
        </div>
      )}

      {target.kind === 'jewel' && (
        <div className="flex flex-col gap-1.5">
          <div className="border-b border-amber-500/30 pb-1">
            <div className="font-display text-sm font-extrabold text-amber-300">
              {target.label}
            </div>
            <div className="font-mono-num text-xs font-bold text-purple-200">
              В стаке: ×{target.count} шт.
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[#e6dec8]">{target.desc}</p>
        </div>
      )}

      {target.kind === 'potion' && (
        <div className="flex flex-col gap-1.5">
          <div className="border-b border-amber-500/30 pb-1">
            <div
              className={`font-display text-sm font-extrabold ${
                target.potionType === 'hp' ? 'text-rose-300' : 'text-sky-300'
              }`}
            >
              {target.potionType === 'hp'
                ? 'Эликсир Исцеления (Банки ОЗ)'
                : 'Эликсир Духа (Банки Маны)'}
            </div>
            <div className="font-mono-num text-xs font-bold text-[#e6dec8]">
              {target.context === 'shop'
                ? `Набор в лавке: +${target.count} шт.`
                : `В запасе: ×${target.count} шт.`}
            </div>
          </div>
          <p className="text-xs text-[#dfd7c8]">
            {target.potionType === 'hp'
              ? 'Мгновенно восстанавливает 48% макс. здоровья [Клавиша Q]. В режиме Авто-Охоты пьётся автоматически при ОЗ ниже 58%.'
              : 'Мгновенно восстанавливает 55% макс. маны [Клавиша E]. В режиме Авто-Охоты пьётся автоматически при МН ниже 35%.'}
          </p>
          {target.priceZen !== undefined && (
            <div className="flex items-center justify-between border-t border-white/10 pt-1 font-mono-num text-xs">
              <span className="text-[#b5ab9b]">Цена набора:</span>
              <span className="font-extrabold text-amber-300">{target.priceZen} Zen</span>
            </div>
          )}
          <div className="text-[10px] italic text-amber-200/85">
            {target.context === 'shop'
              ? 'Перетащите набор банок мышкой в сетку Инвентаря [V] справа, чтобы купить!'
              : 'Пополняйте запас банок в Городской Лавке Ханзо'}
          </div>
        </div>
      )}

      {target.kind === 'quest_item' && (
        <div className="flex flex-col gap-1.5">
          <div className="border-b border-amber-500/30 pb-1">
            <div className="font-display text-sm font-extrabold text-amber-300">
              ★ Квестовая Реликвия: {target.name}
            </div>
            <div className="font-mono-num text-xs font-bold text-emerald-300">
              Статус: {target.hasItem ? '1/1 (Выбита!)' : '0/1 (Не найдена)'}
            </div>
          </div>
          <p className="text-xs text-[#dfd7c8]">
            {target.hasItem
              ? 'Реликвия находится в вашем инвентаре! Откройте окно Статов [C] на 50-м уровне, чтобы сдать квест Жрице Себине и получить 1-ю Профессию.'
              : 'Требуется для получения 1-й Профессии на 50 уровне. Выпадает с элитных монстров с меткой «★ КВЕСТ СЕБИНЫ» (Личи, Минотавры/Големы и Боссы).'}
          </p>
        </div>
      )}
    </div>
  );
};
