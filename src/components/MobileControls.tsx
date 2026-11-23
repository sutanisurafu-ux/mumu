import React, { useRef, useState } from 'react';
import { ClassTier, SkillDefinition } from '../game/types';

interface MobileControlsProps {
  skills: SkillDefinition[];
  classTier: ClassTier;
  playerLevel: number;
  learnedSkills: string[];
  hasWeapon: boolean;
  cooldowns: Record<string, number>;
  hpPotions: number;
  mpPotions: number;
  autoHunt: boolean;
  nearbyLootCount: number;
  comboStage: number;
  isNearShop: boolean;
  onJoystickMove: (dx: number, dy: number) => void;
  onPrimaryAttack: () => void;
  onUseSkill: (skillIndex: number) => void;
  onUseHpPotion: () => void;
  onUseMpPotion: () => void;
  onApproachShop: () => void;
  onPickupLoot: () => void;
  onToggleAutoHunt: () => void;
  onDash: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  skills,
  classTier,
  playerLevel,
  learnedSkills,
  hasWeapon,
  cooldowns,
  hpPotions,
  mpPotions,
  autoHunt,
  nearbyLootCount,
  comboStage,
  isNearShop,
  onJoystickMove,
  onPrimaryAttack,
  onUseSkill,
  onUseHpPotion,
  onUseMpPotion,
  onApproachShop,
  onPickupLoot,
  onToggleAutoHunt,
  onDash,
}) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const maxRadius = 40;
  const autoHuntUnlocked = playerLevel >= 5;

  const updateVectorFromClientXY = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const dist = Math.hypot(rawDx, rawDy);
    if (dist < 4) {
      setKnobOffset({ x: 0, y: 0 });
      onJoystickMove(0, 0);
      return;
    }
    const clampedDist = Math.min(maxRadius, dist);
    const nx = rawDx / dist;
    const ny = rawDy / dist;
    setKnobOffset({ x: nx * clampedDist, y: ny * clampedDist });
    onJoystickMove(nx * (clampedDist / maxRadius), ny * (clampedDist / maxRadius));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateVectorFromClientXY(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    updateVectorFromClientXY(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
    setKnobOffset({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between px-2.5 pb-2.5 sm:px-6 sm:pb-5">
      {/* LEFT THUMB ZONE: Virtual Analog Joystick + Quick Auto-Hunt (Lvl 5+) & HP/MP Potion Row */}
      <div className="flex flex-col items-start gap-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleAutoHunt();
            }}
            aria-label={
              !autoHuntUnlocked
                ? 'Авто-Охота доступна с 5 уровня'
                : autoHunt
                  ? 'Отключить авто-бой'
                  : 'Включить авто-бой'
            }
            title={
              !autoHuntUnlocked
                ? `Авто-Охота открывается на 5 уровне (сейчас Ур. ${playerLevel}/5) [Клавиша ]]`
                : 'Авто-Охота на текущем споте (420px) [Клавиша ]]'
            }
            className={`min-h-[44px] min-w-[44px] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              !autoHuntUnlocked
                ? 'border border-white/15 bg-[#120f1a]/90 text-[#9c9283]'
                : autoHunt
                  ? 'bg-amber-500 text-[#09080c] shadow-[0_0_16px_rgba(245,158,11,0.55)]'
                  : 'gothic-button text-[#e6dec8]'
            }`}
          >
            {!autoHuntUnlocked
              ? '🔒 Авто-Охота (5 Ур.) []]'
              : autoHunt
                ? 'Авто-Охота: ВКЛ []]'
                : 'Авто-Охота []]'}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onUseHpPotion();
            }}
            aria-label={`Банка ОЗ (${hpPotions} шт.) [Q]`}
            title="Выпить Банку ОЗ [Q] (в АФК пьётся автоматически при ОЗ < 58%)"
            className={`gothic-button min-h-[44px] min-w-[44px] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              hpPotions <= 0 ? 'border-rose-500/80 text-rose-400' : 'text-rose-200'
            }`}
          >
            🧪ОЗ ({hpPotions}) [Q]
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onUseMpPotion();
            }}
            aria-label={`Банка МН (${mpPotions} шт.) [E]`}
            title="Выпить Банку Маны [E] (в АФК пьётся автоматически при МН < 35%)"
            className={`gothic-button min-h-[44px] min-w-[44px] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              mpPotions <= 0 ? 'border-sky-500/80 text-sky-400' : 'text-sky-200'
            }`}
          >
            💧МН ({mpPotions}) [E]
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onApproachShop();
            }}
            aria-label={
              isNearShop
                ? 'Открыть Лавку Ханзо (Вы рядом с магазином) [B]'
                : 'Подойти к Лавке Ханзо в городе [B]'
            }
            title={
              isNearShop
                ? 'Вы рядом с Лавкой Ханзо — открыть окно Магазина и Инвентаря [B]'
                : 'Подойти к Лавке Ханзо в городе, чтобы купить вещи, книги скилов и банки [B]'
            }
            className={`min-h-[44px] rounded-xl border px-2.5 py-1.5 text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
              isNearShop
                ? 'border-amber-400/80 bg-[#1e172a] text-amber-300 hover:bg-amber-500 hover:text-[#09080c]'
                : 'border-white/20 bg-[#14111d] text-[#cfc6b8] hover:border-amber-400/60'
            }`}
          >
            {isNearShop ? '🟢 🏪 Лавка [B]' : '🚶 Лавка [B]'}
          </button>
        </div>

        {/* Interactive Touch/Mouse Virtual Stick */}
        <div
          ref={padRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="slider"
          aria-label="Виртуальный джойстик движения"
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={Math.round(knobOffset.x)}
          className="pointer-events-auto relative flex h-24 w-24 touch-none items-center justify-center rounded-full border-2 border-amber-500/45 bg-[#120f18]/90 shadow-[0_6px_24px_rgba(0,0,0,0.85)] sm:h-28 sm:w-28 cursor-grab active:cursor-grabbing"
        >
          <span className="pointer-events-none absolute top-1.5 text-[9px] font-bold text-amber-400/55">▲</span>
          <span className="pointer-events-none absolute bottom-1.5 text-[9px] font-bold text-amber-400/55">▼</span>
          <span className="pointer-events-none absolute left-1.5 text-[9px] font-bold text-amber-400/55">◀</span>
          <span className="pointer-events-none absolute right-1.5 text-[9px] font-bold text-amber-400/55">▶</span>

          <div className="pointer-events-none absolute h-14 w-14 rounded-full border border-amber-500/25" />

          <div
            style={{
              transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
            }}
            className="pointer-events-none relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-300 bg-[#2b2238] shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
          >
            <div className="h-3.5 w-3.5 rounded-full bg-amber-400" />
          </div>
        </div>
      </div>

      {/* RIGHT THUMB ZONE: Ergonomic Mobile ARPG Radial Action & 4-Skill Cluster */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5 sm:gap-2">
        {/* Top contextual row: Combo Indicator, Loot Magnet & Dash */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {comboStage > 0 && (
            <div className="rounded-xl bg-sky-500/20 border border-sky-400 px-2.5 py-1 font-mono-num text-[11px] font-bold text-sky-300">
              КОМБО ШАГ {comboStage}/3
            </div>
          )}

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPickupLoot();
            }}
            aria-label="Собрать трофеи рядом"
            className={`min-h-[44px] min-w-[44px] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              nearbyLootCount > 0
                ? 'bg-emerald-500 text-[#07130d] shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                : 'gothic-button text-[#cfc6b8]'
            }`}
          >
            Лут ({nearbyLootCount}) [F]
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onDash();
            }}
            aria-label="Рывок / Телепорт"
            className="gothic-button min-h-[44px] min-w-[44px] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold text-sky-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Рывок [Shift]
          </button>
        </div>

        {/* Radial Skill Arc (4 skills) + Primary Attack Anchor */}
        <div className="flex items-end gap-1.5 sm:gap-2.5">
          {/* 2x2 on compact mobile or 4-col on desktop so 390px never overflows */}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
            {skills.map((skill, idx) => {
              const cdRemaining = cooldowns[skill.id] ?? 0;
              const isLearned = learnedSkills.includes(skill.id);
              const isTierLocked = (skill.requiredTier ?? 1) > classTier;
              const isLocked = !isLearned || isTierLocked;
              const isReady = !isLocked && cdRemaining <= 0.05;
              const isNextComboStep =
                !isLocked && ((comboStage === 1 && idx === 1) || (comboStage === 2 && idx === 2));

              return (
                <button
                  key={skill.id}
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onUseSkill(idx);
                  }}
                  aria-label={`Навык ${skill.name} (Клавиша ${skill.keyBinding})`}
                  title={
                    !isLearned
                      ? `Не изучено: купите «${skill.bookName}» в Магазине Города [V] за ${skill.bookPriceZen} Zen (Требуется Ур. ${skill.requiredLevel})`
                      : `${skill.name} [${skill.keyBinding}] — Мана: ${skill.manaCost}`
                  }
                  className={`relative flex h-[48px] w-[52px] shrink-0 flex-col items-center justify-center rounded-2xl border sm:h-16 sm:w-16 cursor-pointer ${
                    isLocked
                      ? 'bg-[#110e17] border-white/15 opacity-60'
                      : isNextComboStep
                        ? 'bg-[#1e2638] border-sky-400 ring-2 ring-sky-400/60'
                        : isReady
                          ? 'bg-[#1c1626] border-amber-400/75 shadow-[0_4px_14px_rgba(0,0,0,0.85)]'
                          : 'bg-[#110e17] border-white/15 opacity-75'
                  }`}
                >
                  <span
                    className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full mb-0.5"
                    style={{ backgroundColor: isLocked ? '#6b7280' : skill.color }}
                    aria-hidden="true"
                  />
                  <span className="max-w-[46px] sm:max-w-[56px] truncate text-[9px] sm:text-[10px] font-bold text-[#f5efe4]">
                    {skill.name.split(' ')[0]}
                  </span>
                  <span className="font-mono-num text-[8px] sm:text-[9px] text-amber-300/90">
                    {!isLearned
                      ? `🔒Ур.${skill.requiredLevel}·${skill.bookPriceZen}z`
                      : isTierLocked
                        ? '🔒1 Проф'
                        : `[${skill.keyBinding}]·${skill.manaCost}`}
                  </span>

                  {!isLocked && !isReady && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/75 font-mono-num text-xs font-bold text-amber-300">
                      {cdRemaining.toFixed(1)}s
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Primary Hack-and-Slash Attack Button (Fists when naked, Weapon once equipped) */}
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPrimaryAttack();
            }}
            aria-label={hasWeapon ? 'Основная атака оружием' : 'Удар кулаками (без оружия)'}
            title={hasWeapon ? 'Атака оружием [Пробел]' : 'Удар голыми кулаками [Пробел]'}
            className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-b from-amber-500 to-amber-700 text-[#09080c] shadow-[0_6px_22px_rgba(245,158,11,0.45)] sm:h-20 sm:w-20 cursor-pointer"
          >
            {hasWeapon ? (
              <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8 fill-current" aria-hidden="true">
                <path d="M19.7 4.3c-.4-.4-1-.4-1.4 0L9 13.6 6.7 11.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l2.3 2.3-4.3 4.3c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l4.3-4.3 2.3 2.3c.4.4 1 .4 1.4 0s.4-1 0-1.4L10.4 15l9.3-9.3c.4-.4.4-1 0-1.4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8 fill-current" aria-hidden="true">
                <path d="M8 5a2 2 0 0 1 2 2v2h1V6a2 2 0 1 1 4 0v3h1V7a2 2 0 1 1 4 0v6a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6V9a2 2 0 0 1 3-1.73V7a2 2 0 0 1 0-2z" />
              </svg>
            )}
            <span className="font-display text-[10px] sm:text-[11px] font-extrabold tracking-tight">
              {hasWeapon ? 'АТАКА' : 'КУЛАКИ'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

