import React, { useEffect, useState } from 'react';
import {
  calculatePartyCoopExpBonus,
  formatWorldGameClock,
  getSameZonePartyAllies,
} from '../game/party';
import {
  TERRITORIES,
  calculateDerivedStats,
  getClassDisplayTitle,
} from '../game/rules';
import {
  BloodCastleStage,
  PartyChatMessage,
  PartyMemberState,
  PlayerProgressState,
} from '../game/types';

export interface HudDomRefs {
  hpBarRef: React.RefObject<HTMLDivElement | null>;
  hpGhostBarRef: React.RefObject<HTMLDivElement | null>;
  hpTextRef: React.RefObject<HTMLSpanElement | null>;
  mpBarRef: React.RefObject<HTMLDivElement | null>;
  mpTextRef: React.RefObject<HTMLSpanElement | null>;
  minimapCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  lowHpVignetteRef: React.RefObject<HTMLDivElement | null>;
}

interface HudOverlayProps {
  player: PlayerProgressState;
  hudRefs: HudDomRefs;
  muted: boolean;
  bossActiveName: string | null;
  bossHpPct: number;
  bloodCastleInfo?: {
    active: boolean;
    stage: BloodCastleStage;
    kills: number;
    targetKills: number;
    hasArchangelWeapon: boolean;
  } | null;
  partySelfId: string;
  partyRoomCode: string;
  partyConnected: boolean;
  partyMembers: PartyMemberState[];
  zoneChatMessages: PartyChatMessage[];
  chatInputRef: React.RefObject<HTMLInputElement | null>;
  chatOpen: boolean;
  onSetChatOpen: (open: boolean) => void;
  onSendZoneChat: (text: string) => void;
  onRequestTradeWithAlly: (ally: PartyMemberState) => void;
  onOpenPartyModal: () => void;
  onTeleportToAlly: (ally: PartyMemberState) => void;
  onExitBloodCastle?: () => void;
  onOpenInventory: () => void;
  onOpenStats: () => void;
  onOpenChaosMachine: () => void;
  onOpenTerritory: () => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  player,
  hudRefs,
  muted,
  bossActiveName,
  bossHpPct,
  bloodCastleInfo,
  partySelfId,
  partyRoomCode,
  partyConnected,
  partyMembers,
  zoneChatMessages,
  chatInputRef,
  chatOpen,
  onSetChatOpen,
  onSendZoneChat,
  onRequestTradeWithAlly,
  onOpenPartyModal,
  onTeleportToAlly,
  onExitBloodCastle,
  onOpenInventory,
  onOpenStats,
  onOpenChaosMachine,
  onOpenTerritory,
  onToggleMute,
  onTogglePause,
  onRestart,
}) => {
  const [chatDraft, setChatDraft] = useState<string>('');
  const [worldClock, setWorldClock] = useState(() => formatWorldGameClock());

  useEffect(() => {
    const timer = setInterval(() => {
      setWorldClock(formatWorldGameClock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 20);
    }
  }, [chatOpen, chatInputRef]);

  const derived = calculateDerivedStats(player);
  const displayTitle = getClassDisplayTitle(player.classId, player.classTier);
  const territory = TERRITORIES.find((t) => t.id === player.territoryId) ?? TERRITORIES[0];
  const expPct = Math.min(100, Math.round((player.exp / Math.max(1, player.expToNext)) * 100));
  const killProgressPct = Math.min(
    100,
    Math.round((player.killsInTerritory / territory.targetKillsForBoss) * 100)
  );
  const remotePartyAllies = partyMembers.filter((m) => m.id !== partySelfId);
  const sameZoneAllies = getSameZonePartyAllies(
    partyMembers,
    partySelfId,
    player.territoryId,
    player.inBloodCastle
  );
  const partyExpBonus = calculatePartyCoopExpBonus(100, sameZoneAllies.length);

  const visibleZoneMessages = zoneChatMessages
    .filter((m) =>
      player.inBloodCastle
        ? Boolean(m.inBloodCastle)
        : !m.inBloodCastle && (m.territoryId ?? player.territoryId) === player.territoryId
    )
    .slice(-6);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatDraft.trim();
    if (trimmed) {
      onSendZoneChat(trimmed);
      setChatDraft('');
    }
    onSetChatOpen(false);
    chatInputRef.current?.blur();
  };

  const bcStageDescription = (() => {
    if (!bloodCastleInfo?.active) return '';
    if (bloodCastleInfo.stage === 'kill_100') {
      return `Этап 1/4: Убейте 100 монстров на мосту (${bloodCastleInfo.kills}/${bloodCastleInfo.targetKills})`;
    }
    if (bloodCastleInfo.stage === 'break_gates') {
      return 'Этап 2/4: Сломайте Ворота Замка Крови на севере моста!';
    }
    if (bloodCastleInfo.stage === 'destroy_statue') {
      return 'Этап 3/4: Разбейте Хрустальную Статую за воротами!';
    }
    if (bloodCastleInfo.stage === 'return_weapon') {
      return bloodCastleInfo.hasArchangelWeapon
        ? 'Этап 4/4: Принесите Оружие Архангела к Раненому Архангелу в начале моста!'
        : 'Этап 4/4: Подберите Оружие Архангела у разбитой статуи!';
    }
    return 'Квест выполнен! (+3 Jewel of Chaos и Опыт получены)';
  })();

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between">
      {/* Peripheral Critical Low-HP Red Vignette */}
      <div
        ref={hudRefs.lowHpVignetteRef}
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_58%,rgba(220,38,38,0.45)_100%)]"
      />

      {/* TOP PERIMETER CLUSTERS */}
      <div className="flex flex-col gap-1.5 px-2.5 pt-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-5 sm:pt-3.5">
        {/* TOP-LEFT CLUSTER: Hero Vitality, Mana, EXP, Zen, Jewels & Set Status */}
        <div className="pointer-events-auto gothic-panel flex w-full flex-col gap-1.5 rounded-2xl p-2.5 sm:w-auto sm:min-w-[365px] sm:max-w-[435px] sm:gap-2 sm:p-3.5">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/50 bg-[#1a1423] font-display text-xs sm:text-sm font-extrabold text-amber-300"
                title={displayTitle}
              >
                Ур.{player.level}
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-xs font-bold text-[#fdf8ed] sm:text-sm">
                  {displayTitle}
                </div>
                <div className="font-mono-num text-[10px] sm:text-[11px] text-amber-300/90">
                  БМ {derived.combatPower} · АТК {derived.minDamage}–{derived.maxDamage} · Сет {derived.activeSetPieceCount}/3
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenStats();
                }}
                aria-label="Открыть статы персонажа [C]"
                title="Статы Персонажа и Профессия [C]"
                className={`min-h-[40px] rounded-xl px-2.5 py-1 text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  player.statPoints > 0
                    ? 'bg-amber-500 text-[#09080c] shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'gothic-button text-amber-200 border-amber-400/50'
                }`}
              >
                {player.statPoints > 0
                  ? `📊 Статы (+${player.statPoints}) [C]`
                  : '📊 Статы [C]'}
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenInventory();
                }}
                aria-label="Открыть инвентарь и экипировку [V]"
                title="Инвентарь, Экипировка и Лавка [V]"
                className="gothic-button min-h-[40px] rounded-xl px-2.5 py-1 text-[11px] font-bold text-amber-200 border-amber-400/50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                🎒 Инвентарь [V]
              </button>
            </div>
          </div>

          {/* HP & MP Bars with Delayed Ghost Drain Bar */}
          <div className="flex flex-col gap-1">
            <div className="relative h-3.5 sm:h-4 w-full overflow-hidden rounded-md bg-[#1a0d12] border border-rose-500/35">
              <div
                ref={hudRefs.hpGhostBarRef}
                style={{ transform: 'scaleX(1)' }}
                className="absolute inset-y-0 left-0 w-full origin-left bg-amber-300/70"
              />
              <div
                ref={hudRefs.hpBarRef}
                style={{ transform: 'scaleX(1)' }}
                className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-rose-700 to-rose-500"
              />
              <div className="relative z-10 flex h-full items-center justify-between px-2 font-mono-num text-[10px] font-bold text-white">
                <span>ОЗ</span>
                <span ref={hudRefs.hpTextRef}>
                  {derived.maxHp}/{derived.maxHp}
                </span>
              </div>
            </div>

            <div className="relative h-3 sm:h-3.5 w-full overflow-hidden rounded-md bg-[#0d1424] border border-sky-500/35">
              <div
                ref={hudRefs.mpBarRef}
                style={{ transform: 'scaleX(1)' }}
                className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-blue-700 to-sky-400"
              />
              <div className="relative z-10 flex h-full items-center justify-between px-2 font-mono-num text-[10px] font-bold text-white">
                <span>МН</span>
                <span ref={hudRefs.mpTextRef}>
                  {derived.maxMp}/{derived.maxMp}
                </span>
              </div>
            </div>

            <div className="relative h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-[#15121d]">
              <div
                style={{ width: `${expPct}%` }}
                className="h-full bg-amber-400"
              />
            </div>
          </div>

          {/* Currencies & Potions: Zen, HP/MP Potions, Jewels & Blood Castle Materials */}
          <div className="flex flex-wrap items-center justify-between gap-1 border-t border-white/10 pt-1 font-mono-num text-[10px] sm:text-[11px] text-[#dfd7c8]">
            <span className="font-bold text-amber-300">{player.zen} Zen</span>
            <span aria-hidden="true">·</span>
            <span className={player.hpPotions <= 1 ? 'font-bold text-rose-400' : 'text-rose-200'}>
              ОЗ🧪{player.hpPotions}
            </span>
            <span aria-hidden="true">·</span>
            <span className={player.mpPotions <= 1 ? 'font-bold text-sky-400' : 'text-sky-200'}>
              МН💧{player.mpPotions}
            </span>
            <span aria-hidden="true">·</span>
            <span>Chaos {player.jewels.chaos}</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-200">
              BC 📜{player.bloodScrolls}/🦷{player.bloodFangs}/🎟️{player.bloodCastleTickets}
            </span>
            {player.hasFirstProfQuestItem && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-amber-300">★Квест</span>
              </>
            )}
          </div>

          {/* COMPACT MU PARTY & TRADE BAR INSIDE TOP-LEFT CLUSTER */}
          <div className="flex flex-col gap-1 border-t border-emerald-500/25 pt-1.5">
            <div className="flex items-center justify-between gap-1.5 text-[10px] font-mono-num">
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenPartyModal();
                }}
                aria-label="Открыть окно Онлайн Пати и Деплоя на VPS [O]"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-bold text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    partyConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span>
                  🤝 Пати #{partyRoomCode} ({partyMembers.length}/5) [O]
                </span>
              </button>
              <span className="text-emerald-300 font-bold">
                {sameZoneAllies.length > 0
                  ? `+${partyExpBonus.bonusPct}% Кооп Опыт`
                  : 'Зовите друга по ссылке [O]'}
              </span>
            </div>

            {remotePartyAllies.length > 0 && (
              <div className="flex flex-col gap-1 mt-0.5">
                {remotePartyAllies.slice(0, 4).map((ally) => {
                  const allyHpPct = Math.max(
                    0,
                    Math.min(100, Math.round((ally.hp / Math.max(1, ally.maxHp)) * 100))
                  );
                  const allyTerritory =
                    TERRITORIES.find((t) => t.id === ally.territoryId) ?? TERRITORIES[0];
                  const isAllySameZone = player.inBloodCastle
                    ? ally.inBloodCastle
                    : !ally.inBloodCastle && ally.territoryId === player.territoryId;

                  return (
                    <div
                      key={ally.id}
                      className="flex items-center justify-between gap-1.5 rounded-lg border border-emerald-500/30 bg-[#10191d] px-2 py-1 text-[10px] font-mono-num"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-bold text-emerald-200">
                            🤝 {ally.nickname} · Ур.{ally.level}
                          </span>
                          <span className="truncate text-[9px] text-sky-300">
                            {ally.inBloodCastle
                              ? '🩸BC'
                              : allyTerritory.name.replace(/^\d+\.\s*/, '').slice(0, 12)}
                          </span>
                        </div>
                        <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded bg-[#1a0d12]">
                          <div
                            style={{ width: `${allyHpPct}%` }}
                            className="h-full bg-emerald-400"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isAllySameZone && (
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={(e) => {
                              e.currentTarget.blur();
                              onRequestTradeWithAlly(ally);
                            }}
                            title={`Предложить Трейд игроку ${ally.nickname}`}
                            aria-label={`Трейд с игроком ${ally.nickname}`}
                            className="rounded-md bg-amber-400 px-1.5 py-0.5 font-display text-[9px] font-extrabold text-[#09080c] hover:bg-amber-300 cursor-pointer"
                          >
                            ⚖️Трейд
                          </button>
                        )}
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onTeleportToAlly(ally);
                          }}
                          title={`Телепортироваться к ${ally.nickname}`}
                          className="rounded-md bg-emerald-500 px-1.5 py-0.5 font-display text-[9px] font-extrabold text-[#09080c] hover:bg-emerald-400 cursor-pointer"
                        >
                          ⚡ТП
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CENTER BLOOD CASTLE EVENT TRACKER OR BOSS BAR */}
        {bloodCastleInfo?.active ? (
          <div className="pointer-events-auto flex flex-col items-center gothic-panel rounded-xl border-rose-500/50 bg-[#1a0d14]/95 px-4 py-2.5 min-w-[290px] max-w-[440px]">
            <div className="flex w-full items-center justify-between gap-2">
              <span className="font-display text-xs font-extrabold text-rose-300 tracking-wide">
                🩸 ИВЕНТ: BLOOD CASTLE (МОСТ АРХАНГЕЛА)
              </span>
              {onExitBloodCastle && (
                <button
                  type="button"
                  onClick={onExitBloodCastle}
                  className="rounded-lg bg-rose-500/25 border border-rose-400/50 px-2 py-0.5 text-[10px] font-bold text-rose-200 hover:bg-rose-500 hover:text-white cursor-pointer"
                >
                  В город
                </button>
              )}
            </div>
            <div className="mt-1 text-center font-mono-num text-[11px] font-bold text-amber-200">
              {bcStageDescription}
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#1c0c10] border border-rose-500/40">
              <div
                style={{
                  width: `${
                    bloodCastleInfo.stage === 'kill_100'
                      ? Math.min(100, Math.round((bloodCastleInfo.kills / bloodCastleInfo.targetKills) * 100))
                      : bloodCastleInfo.stage === 'break_gates'
                        ? Math.max(10, bossHpPct)
                        : bloodCastleInfo.stage === 'destroy_statue'
                          ? Math.max(10, bossHpPct)
                          : 100
                  }%`,
                }}
                className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-400"
              />
            </div>
          </div>
        ) : (
          bossActiveName && (
            <div className="pointer-events-none hidden lg:flex flex-col items-center gothic-panel rounded-xl px-5 py-2.5 min-w-[280px]">
              <div className="font-display text-xs font-bold text-rose-400 tracking-wide">
                БОСС ТЕРРИТОРИИ: {bossActiveName}
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-[#1c0c10] border border-rose-500/40">
                <div
                  style={{ width: `${Math.max(0, Math.min(100, bossHpPct))}%` }}
                  className="h-full bg-gradient-to-r from-rose-600 to-amber-500"
                />
              </div>
            </div>
          )
        )}

        {/* TOP-RIGHT CLUSTER: Persistent MU Game Time Clock, Territory Progress, Minimap & Compact Action Buttons */}
        <div className="pointer-events-auto flex w-full items-center justify-between gap-1.5 sm:w-auto sm:flex-col sm:items-end sm:gap-2">
          <div className="gothic-panel hidden sm:flex items-center gap-2.5 rounded-2xl p-2">
            <div className="flex flex-col text-right px-1.5">
              <div className="flex items-center justify-end gap-1.5">
                <span
                  data-testid="world-game-time-clock"
                  title="Игровое время мира MU идёт непрерывно, даже когда вы не в игре. Респаун каждого монстра привязан к локации и игровому времени."
                  className="rounded-md border border-amber-400/45 bg-amber-500/15 px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-amber-200"
                >
                  ⏳ Игр. время: День {worldClock.dayNumber} · {worldClock.formattedTime} ({worldClock.phaseLabel})
                </span>
              </div>
              <span className="mt-0.5 font-display text-xs font-bold text-amber-300">
                {player.inBloodCastle ? '🩸 Blood Castle (Мост)' : territory.name}
              </span>
              <span className="font-mono-num text-[11px] text-[#cfc6b8]">
                {player.inBloodCastle
                  ? `Убито на мосту: ${bloodCastleInfo?.kills ?? 0}/100`
                  : bossActiveName
                    ? `Босс: ${bossActiveName}`
                    : `До Босса: ${Math.min(player.killsInTerritory, territory.targetKillsForBoss)}/${territory.targetKillsForBoss} (${killProgressPct}%)`}
              </span>
            </div>

            <canvas
              ref={hudRefs.minimapCanvasRef}
              width={76}
              height={76}
              aria-label="Мини-карта территории"
              className="h-[68px] w-[68px] sm:h-[76px] sm:w-[76px] rounded-xl border border-amber-500/40 bg-[#0b0910]"
            />
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-1 sm:w-auto sm:justify-end sm:gap-1.5">
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenPartyModal();
              }}
              aria-label="Онлайн Пати с другом и деплой на VPS [O]"
              className="gothic-button min-h-[44px] flex-1 sm:flex-initial rounded-xl border-emerald-400/50 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-bold text-emerald-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              🤝 Пати ({partyMembers.length}/5) [O]
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenChaosMachine();
              }}
              aria-label="Машина Хаоса и Крафт [K]"
              className="gothic-button min-h-[44px] flex-1 sm:flex-initial rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold text-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Машина Хаоса [K]
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenTerritory();
              }}
              aria-label="Города и локации континента MU [T]"
              className="gothic-button min-h-[44px] flex-1 sm:flex-initial rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Города (24) [T]
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              aria-label={muted ? 'Включить звук [M]' : 'Выключить звук [M]'}
              className="gothic-button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-amber-200 cursor-pointer"
            >
              {muted ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onTogglePause();
              }}
              aria-label="Пауза [P]"
              className="gothic-button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-amber-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onRestart();
              }}
              aria-label="Перезапустить локацию [R]"
              className="gothic-button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-amber-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM-LEFT ZONE CHAT BOX (ENTER OPENS & SENDS MESSAGE TO EVERYONE IN LOCATION) */}
      <div className="pointer-events-auto mb-28 ml-2.5 flex w-[285px] flex-col gap-1 sm:mb-24 sm:ml-5 sm:w-[335px]">
        <div
          data-testid="zone-chat-log"
          className="flex max-h-[125px] flex-col gap-1 overflow-y-auto rounded-xl border border-amber-500/25 bg-[#0c0a14]/85 px-2.5 py-2 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1 text-[10px] font-mono-num text-amber-300/90">
            <span>
              💬 Чат локации:{' '}
              {player.inBloodCastle
                ? 'Blood Castle'
                : territory.name.replace(/^\d+\.\s*/, '').split(' (')[0]}
            </span>
            <span className="text-[#a89f91]">[Enter] — написать</span>
          </div>

          {visibleZoneMessages.length === 0 ? (
            <div className="py-1 text-[10px] italic text-[#8a8070]">
              Нажмите [Enter], чтобы написать сообщение всем игрокам на локации...
            </div>
          ) : (
            visibleZoneMessages.map((msg) => (
              <div key={msg.id} className="text-[11px] leading-snug break-words">
                <span
                  className={`font-bold ${
                    msg.senderId === partySelfId ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  [{msg.nickname}]:
                </span>{' '}
                <span className="text-[#f5f0e6]">{msg.text}</span>
              </div>
            ))
          )}
        </div>

        {chatOpen ? (
          <form onSubmit={handleChatSubmit} className="flex items-center gap-1.5">
            <input
              ref={chatInputRef}
              type="text"
              value={chatDraft}
              maxLength={140}
              onChange={(e) => setChatDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  onSetChatOpen(false);
                  e.currentTarget.blur();
                }
              }}
              aria-label="Сообщение в чат локации"
              placeholder="Сообщение на локацию (Enter — отправить)..."
              className="flex-1 rounded-xl border-2 border-amber-400 bg-[#120e1c]/95 px-3 py-1.5 text-xs text-white placeholder-[#8a8070] focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Отправить сообщение в чат локации"
              className="rounded-xl bg-amber-500 px-3 py-1.5 font-display text-xs font-extrabold text-[#09080c] hover:bg-amber-400 cursor-pointer"
            >
              ↵
            </button>
          </form>
        ) : (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onSetChatOpen(true)}
            aria-label="Открыть чат локации [Enter]"
            className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-[#120e1c]/80 px-3 py-1 text-left text-[11px] text-[#bfb5a4] hover:border-amber-400/60 hover:text-amber-200 cursor-pointer"
          >
            <span>💬 Нажмите [Enter] для чата на локации...</span>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-amber-300">
              ENTER
            </span>
          </button>
        )}
      </div>
    </div>
  );
};


