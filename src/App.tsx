import { useCallback, useEffect, useRef, useState } from 'react';
import { ChaosMachineModal } from './components/ChaosMachineModal';
import { CharacterInventoryModal } from './components/CharacterInventoryModal';
import { CharacterStatsModal } from './components/CharacterStatsModal';
import { CityShopModal } from './components/CityShopModal';
import { GameCanvas, GameEngineActions } from './components/GameCanvas';
import { HudDomRefs, HudOverlay } from './components/HudOverlay';
import { CrossModalDragPayload } from './components/ItemHoverTooltip';
import { MobileControls } from './components/MobileControls';
import { PartyCoopModal } from './components/PartyCoopModal';
import { StatusModal } from './components/StatusModal';
import { TerritoryModal } from './components/TerritoryModal';
import { TitleScreen } from './components/TitleScreen';
import {
  DEFAULT_PARTY_ROOM,
  calculatePartyCoopExpBonus,
  getSameZonePartyAllies,
  sanitizePartyCode,
  sanitizePlayerNickname,
} from './game/party';
import {
  CLASSES,
  TERRITORIES,
  allocateStatPoint,
  buyPotionsWithZen,
  buyShopEquipmentToInventory,
  buySkillBookWithZen,
  calculateDerivedStats,
  completeBloodCastleQuest,
  craftBloodCastleTicket,
  craftChaosWings,
  createInitialPlayerState,
  enterBloodCastle,
  equipItemFromInventory,
  evolveCharacterClass,
  exitBloodCastle,
  grantExperience,
  performGrandReset,
  unequipItemToInventory,
  upgradeItemWithJewel,
} from './game/rules';
import { soundEngine } from './game/sound';
import {
  BloodCastleStage,
  CharacterAttributes,
  CharacterClassId,
  EndOfRunSnapshot,
  EquipmentItem,
  GamePhase,
  ItemSlot,
  LootDrop,
  PartyAttackEvent,
  PartyChatMessage,
  PartyKillShareEvent,
  PartyMemberState,
  PartyZoneMonsterSnapshot,
  PlayerProgressState,
  SkillDefinition,
  TerritoryId,
} from './game/types';

type ActiveDrawer = 'none' | 'chaos_machine' | 'territory' | 'party';

export default function App() {
  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const initialPartyFromUrl =
    typeof window !== 'undefined'
      ? sanitizePartyCode(
          new URLSearchParams(window.location.search).get('party') ?? DEFAULT_PARTY_ROOM
        )
      : DEFAULT_PARTY_ROOM;

  const [phase, setPhase] = useState<GamePhase>(isAutostart ? 'playing' : 'title');
  const [selectedClass, setSelectedClass] = useState<CharacterClassId>('dark_knight');
  const [player, setPlayer] = useState<PlayerProgressState>(() =>
    createInitialPlayerState('dark_knight')
  );
  const [inventoryOpen, setInventoryOpen] = useState<boolean>(false);
  const [statsOpen, setStatsOpen] = useState<boolean>(false);
  const [shopOpen, setShopOpen] = useState<boolean>(false);
  const [activeDragPayload, setActiveDragPayload] = useState<CrossModalDragPayload | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>('none');
  const [autoHunt, setAutoHunt] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  // Online Co-op Party State
  const [partySelfId, setPartySelfId] = useState<string>('local_hero');
  const [partyNickname, setPartyNickname] = useState<string>(
    () => `Рыцарь-${Math.floor(100 + Math.random() * 899)}`
  );
  const [partyRoomCode, setPartyRoomCode] = useState<string>(initialPartyFromUrl);
  const [partyConnected, setPartyConnected] = useState<boolean>(false);
  const [partyMembers, setPartyMembers] = useState<PartyMemberState[]>([]);
  const [partyChatMessages, setPartyChatMessages] = useState<PartyChatMessage[]>([]);
  const [partyError, setPartyError] = useState<string | null>(null);

  const partyMembersRef = useRef<PartyMemberState[]>([]);
  partyMembersRef.current = partyMembers;

  const wsRef = useRef<WebSocket | null>(null);
  const playerStateRef = useRef<PlayerProgressState>(player);
  playerStateRef.current = player;
  const partyNicknameRef = useRef<string>(partyNickname);
  partyNicknameRef.current = partyNickname;
  const partyRoomCodeRef = useRef<string>(partyRoomCode);
  partyRoomCodeRef.current = partyRoomCode;
  const partySelfIdRef = useRef<string>(partySelfId);
  partySelfIdRef.current = partySelfId;

  const [hudSync, setHudSync] = useState<{
    cooldowns: Record<string, number>;
    nearbyLootCount: number;
    bossActiveName: string | null;
    bossHpPct: number;
    comboStage: number;
    isNearShop: boolean;
    bloodCastleInfo?: {
      active: boolean;
      stage: BloodCastleStage;
      kills: number;
      targetKills: number;
      hasArchangelWeapon: boolean;
    } | null;
  }>({
    cooldowns: {},
    nearbyLootCount: 0,
    bossActiveName: null,
    bossHpPct: 0,
    comboStage: 0,
    isNearShop: true,
    bloodCastleInfo: null,
  });

  const sessionStartRef = useRef<number>(Date.now());
  const [endSnapshot, setEndSnapshot] = useState<EndOfRunSnapshot | null>(null);

  const hpBarRef = useRef<HTMLDivElement | null>(null);
  const hpGhostBarRef = useRef<HTMLDivElement | null>(null);
  const hpTextRef = useRef<HTMLSpanElement | null>(null);
  const mpBarRef = useRef<HTMLDivElement | null>(null);
  const mpTextRef = useRef<HTMLSpanElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lowHpVignetteRef = useRef<HTMLDivElement | null>(null);

  const hudRefs: HudDomRefs = {
    hpBarRef,
    hpGhostBarRef,
    hpTextRef,
    mpBarRef,
    mpTextRef,
    minimapCanvasRef,
    lowHpVignetteRef,
  };

  const engineActionsRef = useRef<GameEngineActions | null>(null);

  useEffect(() => {
    document.body.dataset.state = phase;
  }, [phase]);

  // Real-time WebSocket Connection & Automatic Reconnection for Online Co-op Party
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let unmounted = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connectWs = () => {
      if (unmounted) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws`;
      let socket: WebSocket;
      try {
        socket = new WebSocket(wsUrl);
      } catch {
        reconnectTimer = setTimeout(connectWs, 2500);
        return;
      }
      wsRef.current = socket;

      socket.onopen = () => {
        if (unmounted) return;
        setPartyConnected(true);
        setPartyError(null);
        const p = playerStateRef.current;
        const derived = calculateDerivedStats(p);
        socket.send(
          JSON.stringify({
            type: 'party:join',
            roomCode: partyRoomCodeRef.current,
            nickname: partyNicknameRef.current,
            classId: p.classId,
            classTier: p.classTier,
            level: p.level,
            resets: p.resets,
            hp: derived.maxHp,
            maxHp: derived.maxHp,
            mp: derived.maxMp,
            maxMp: derived.maxMp,
            territoryId: p.territoryId,
            inBloodCastle: p.inBloodCastle,
            hasWeapon: p.equipped.weapon !== null,
            hasWings: p.equipped.wings !== null,
          })
        );
      };

      socket.onmessage = (evt) => {
        if (unmounted) return;
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(String(evt.data)) as Record<string, unknown>;
        } catch {
          return;
        }
        if (!data || typeof data.type !== 'string') return;

        if (data.type === 'party:init') {
          const selfId = typeof data.selfId === 'string' ? data.selfId : 'local_hero';
          const confirmedRoom =
            typeof data.roomCode === 'string' ? data.roomCode : partyRoomCodeRef.current;
          setPartySelfId(selfId);
          partySelfIdRef.current = selfId;
          setPartyRoomCode(confirmedRoom);
          partyRoomCodeRef.current = confirmedRoom;
          if (Array.isArray(data.members)) {
            setPartyMembers(data.members as PartyMemberState[]);
          }
          if (Array.isArray(data.chatHistory)) {
            setPartyChatMessages(data.chatHistory as PartyChatMessage[]);
          }
          return;
        }

        if (data.type === 'party:member_joined' || data.type === 'party:member_updated') {
          const incoming = data.member as PartyMemberState | undefined;
          if (!incoming || typeof incoming.id !== 'string') return;
          const isJoin = data.type === 'party:member_joined';
          setPartyMembers((prev) => {
            const exists = prev.some((m) => m.id === incoming.id);
            if (!exists) {
              return [...prev, incoming];
            }
            return prev.map((m) => (m.id === incoming.id ? { ...m, ...incoming } : m));
          });
          if (isJoin && incoming.id !== partySelfIdRef.current) {
            engineActionsRef.current?.notifyStatusMessage(
              `🤝 ${incoming.nickname} присоединился к вашей Пати #${partyRoomCodeRef.current}!`,
              '#34d399'
            );
          }
          return;
        }

        if (data.type === 'party:member_left') {
          const leftId = typeof data.memberId === 'string' ? data.memberId : '';
          const leftNick = typeof data.nickname === 'string' ? data.nickname : 'Союзник';
          if (!leftId) return;
          setPartyMembers((prev) => prev.filter((m) => m.id !== leftId));
          engineActionsRef.current?.notifyStatusMessage(
            `👋 ${leftNick} покинул Пати.`,
            '#fbbf24'
          );
          return;
        }

        if (data.type === 'party:remote_attack') {
          const attack = data.attack as PartyAttackEvent | undefined;
          if (!attack) return;
          setPartyMembers((prev) =>
            prev.map((m) =>
              m.id === attack.attackerId
                ? {
                    ...m,
                    x: attack.x,
                    y: attack.y,
                    facingAngle: attack.facingAngle,
                    activeSkillPattern: attack.pattern,
                    activeSkillColor: attack.skillColor,
                    activeSkillTimestamp: Date.now(),
                  }
                : m
            )
          );
          engineActionsRef.current?.applyRemotePartyAttack(attack);
          return;
        }

        if (data.type === 'party:zone_monsters') {
          const snapshot = data.snapshot as PartyZoneMonsterSnapshot | undefined;
          if (!snapshot || !Array.isArray(snapshot.monsters)) return;
          engineActionsRef.current?.applySharedZoneMonsters(snapshot);
          return;
        }

        if (data.type === 'party:shared_kill') {
          const kill = data.kill as PartyKillShareEvent | undefined;
          if (!kill) return;
          const localP = playerStateRef.current;
          const sameZone = kill.inBloodCastle
            ? localP.inBloodCastle
            : !localP.inBloodCastle && localP.territoryId === kill.territoryId;
          if (!sameZone) return;

          // Transition the exact shared monster to KO and spawn loot drops on the friend's floor too!
          engineActionsRef.current?.applyRemoteSharedKill(kill);

          setPlayer((prev) => {
            const { nextState, leveledUp } = grantExperience(prev, kill.expShare);
            if (leveledUp) {
              soundEngine.playLevelUp();
            }
            const currTerritoryIdx = Math.max(
              0,
              TERRITORIES.findIndex((t) => t.id === prev.territoryId)
            );
            const unlockedIdx = kill.isBoss
              ? Math.min(
                  TERRITORIES.length - 1,
                  Math.max(prev.highestReachedTerritoryIdx, currTerritoryIdx + 1)
                )
              : prev.highestReachedTerritoryIdx;

            return {
              ...nextState,
              zen: prev.zen + kill.zenShare,
              killsInTerritory: prev.killsInTerritory + 1,
              totalKills: prev.totalKills + 1,
              bossesDefeated: prev.bossesDefeated + (kill.isBoss ? 1 : 0),
              highestReachedTerritoryIdx: unlockedIdx,
            };
          });

          engineActionsRef.current?.notifyStatusMessage(
            `🤝 Пати [${kill.killerNickname}]: +${kill.expShare} EXP · +${kill.zenShare} Zen`,
            '#34d399'
          );
          return;
        }

        if (data.type === 'party:chat_message') {
          const chatMsg = data.message as PartyChatMessage | undefined;
          if (!chatMsg || typeof chatMsg.id !== 'string') return;
          setPartyChatMessages((prev) => {
            if (prev.some((m) => m.id === chatMsg.id)) return prev;
            return [...prev.slice(-34), chatMsg];
          });
          setPartyMembers((prev) =>
            prev.map((m) =>
              m.id === chatMsg.senderId
                ? {
                    ...m,
                    chatBubbleText: chatMsg.text,
                    chatBubbleExpiresAt: Date.now() + 6500,
                  }
                : m
            )
          );
          return;
        }

        if (data.type === 'party:error') {
          const errMsg = typeof data.message === 'string' ? data.message : 'Ошибка пати';
          setPartyError(errMsg);
          engineActionsRef.current?.notifyStatusMessage(errMsg, '#f43f5e');
        }
      };

      socket.onclose = () => {
        if (unmounted) return;
        setPartyConnected(false);
        reconnectTimer = setTimeout(connectWs, 2200);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connectWs();

    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleUpdatePartyIdentity = useCallback(
    (rawNick: string, rawRoom: string) => {
      const nextNick = sanitizePlayerNickname(rawNick, partyNicknameRef.current);
      const nextRoom = sanitizePartyCode(rawRoom);
      setPartyNickname(nextNick);
      partyNicknameRef.current = nextNick;
      setPartyRoomCode(nextRoom);
      partyRoomCodeRef.current = nextRoom;
      setPartyError(null);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('party', nextRoom);
        window.history.replaceState({}, '', url.toString());
      }

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        const p = playerStateRef.current;
        const derived = calculateDerivedStats(p);
        ws.send(
          JSON.stringify({
            type: 'party:join',
            roomCode: nextRoom,
            nickname: nextNick,
            classId: p.classId,
            classTier: p.classTier,
            level: p.level,
            resets: p.resets,
            hp: derived.maxHp,
            maxHp: derived.maxHp,
            mp: derived.maxMp,
            maxMp: derived.maxMp,
            territoryId: p.territoryId,
            inBloodCastle: p.inBloodCastle,
            hasWeapon: p.equipped.weapon !== null,
            hasWings: p.equipped.wings !== null,
          })
        );
        engineActionsRef.current?.notifyStatusMessage(
          `🤝 Вы в Пати #${nextRoom} как «${nextNick}»!`,
          '#34d399'
        );
      }
    },
    []
  );

  const handleSendPartyChat = useCallback((text: string) => {
    const cleaned = text.trim().slice(0, 140);
    if (!cleaned) return;
    engineActionsRef.current?.setLocalChatBubble(cleaned);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'party:chat',
          text: cleaned,
        })
      );
    }
  }, []);

  const handlePartySyncHero = useCallback(
    (snapshot: {
      x: number;
      y: number;
      facingAngle: number;
      walkDistance: number;
      hp: number;
      maxHp: number;
      mp: number;
      maxMp: number;
    }) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const p = playerStateRef.current;
      ws.send(
        JSON.stringify({
          type: 'party:sync',
          nickname: partyNicknameRef.current,
          classId: p.classId,
          classTier: p.classTier,
          level: p.level,
          resets: p.resets,
          hp: snapshot.hp,
          maxHp: snapshot.maxHp,
          mp: snapshot.mp,
          maxMp: snapshot.maxMp,
          territoryId: p.territoryId,
          inBloodCastle: p.inBloodCastle,
          x: snapshot.x,
          y: snapshot.y,
          facingAngle: snapshot.facingAngle,
          walkDistance: snapshot.walkDistance,
          hasWeapon: p.equipped.weapon !== null,
          hasWings: p.equipped.wings !== null,
        })
      );
    },
    []
  );

  const monsterSyncIdleCounterRef = useRef<number>(0);

  const handlePartySyncZoneMonsters = useCallback(
    (snapshot: Omit<PartyZoneMonsterSnapshot, 'hostId' | 'timestamp'>) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const sameZoneAllies = getSameZonePartyAllies(
        partyMembersRef.current,
        partySelfIdRef.current,
        snapshot.territoryId,
        snapshot.inBloodCastle
      );
      // When friends are in the same zone, sync every tick (~11Hz). When alone, sync every 8th tick (~0.75s) so the server cache is ready on join.
      if (sameZoneAllies.length === 0) {
        monsterSyncIdleCounterRef.current += 1;
        if (monsterSyncIdleCounterRef.current % 8 !== 0) {
          return;
        }
      }
      ws.send(
        JSON.stringify({
          type: 'party:monsters_sync',
          ...snapshot,
        })
      );
    },
    []
  );

  const handlePartyBroadcastAttack = useCallback(
    (attack: {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      facingAngle: number;
      pattern: SkillDefinition['pattern'] | 'primary';
      skillColor: string;
      damage: number;
      aoeRadius: number;
      hitEnemyIds: string[];
    }) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(
        JSON.stringify({
          type: 'party:attack',
          ...attack,
        })
      );
    },
    []
  );

  const handlePartyBroadcastKill = useCallback(
    (kill: {
      enemyId: string;
      monsterName: string;
      isBoss: boolean;
      expReward: number;
      zenReward: number;
      x: number;
      y: number;
    }) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const p = playerStateRef.current;
      const sameZoneAllies = getSameZonePartyAllies(
        partyMembersRef.current,
        partySelfIdRef.current,
        p.territoryId,
        p.inBloodCastle
      );
      if (sameZoneAllies.length === 0) return;
      const coop = calculatePartyCoopExpBonus(kill.expReward, sameZoneAllies.length);
      ws.send(
        JSON.stringify({
          type: 'party:kill',
          enemyId: kill.enemyId,
          monsterName: kill.monsterName,
          isBoss: kill.isBoss,
          expShare: coop.sharedAllyExp,
          zenShare: Math.max(10, Math.round(kill.zenReward * 0.55)),
          x: kill.x,
          y: kill.y,
        })
      );
    },
    []
  );

  const handleTeleportToAlly = useCallback((ally: PartyMemberState) => {
    setPlayer((prev) => {
      const targetTerritoryIdx = Math.max(
        0,
        TERRITORIES.findIndex((t) => t.id === ally.territoryId)
      );
      return {
        ...prev,
        inBloodCastle: ally.inBloodCastle,
        territoryId: ally.territoryId,
        highestReachedTerritoryIdx: Math.max(
          prev.highestReachedTerritoryIdx,
          targetTerritoryIdx
        ),
      };
    });
    setActiveDrawer('none');
    setTimeout(() => {
      engineActionsRef.current?.teleportToCoordinates(
        ally.x,
        ally.y,
        `⚡ Телепорт к другу ${ally.nickname}!`
      );
    }, 50);
  }, []);

  const startNewGameWithClass = useCallback((classId: CharacterClassId) => {
    document.body.dataset.state = 'playing';
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const freshState = createInitialPlayerState(classId);
    setPlayer(freshState);
    setAutoHunt(false);
    setInventoryOpen(false);
    setStatsOpen(false);
    setShopOpen(false);
    setActiveDragPayload(null);
    setActiveDrawer('none');
    setEndSnapshot(null);
    sessionStartRef.current = Date.now();
    setPhase('playing');
    setTimeout(() => {
      engineActionsRef.current?.resetTerritoryArena(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (shopOpen && !hudSync.isNearShop) {
      setShopOpen(false);
      engineActionsRef.current?.notifyStatusMessage(
        'Вы отошли от Лавки Ханзо — окно магазина закрыто.',
        '#fbbf24'
      );
    }
  }, [shopOpen, hudSync.isNearShop]);

  const handleApproachOrOpenShop = useCallback(() => {
    if (hudSync.isNearShop) {
      setShopOpen((prev) => {
        const next = !prev;
        if (next) {
          setStatsOpen(false);
          setInventoryOpen(true);
        }
        return next;
      });
    } else {
      engineActionsRef.current?.walkToShopNpc();
    }
  }, [hudSync.isNearShop]);

  const handleToggleAutoHunt = useCallback(() => {
    if (player.level < 5) {
      setAutoHunt(false);
      engineActionsRef.current?.notifyStatusMessage(
        `🔒 Авто-Охота доступна с 5 уровня (сейчас Ур. ${player.level}/5)!`,
        '#fbbf24'
      );
      return;
    }
    setAutoHunt((prev) => !prev);
  }, [player.level]);

  const buildSnapshot = useCallback(
    (outcome: 'victory' | 'defeat', bossHpRemaining = 0): EndOfRunSnapshot => {
      const territory =
        TERRITORIES.find((t) => t.id === player.territoryId) ?? TERRITORIES[0];
      const derived = calculateDerivedStats(player);
      return {
        outcome,
        classId: player.classId,
        level: player.level,
        territoryName: territory.name,
        totalKills: player.totalKills,
        bossesDefeated: player.bossesDefeated,
        zenCollected: player.zen,
        combatPower: derived.combatPower,
        clearTimeSec: Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000)),
        bossHpRemaining,
      };
    },
    [player]
  );

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Do not trigger game hotkeys when typing in an input field (e.g. Party Chat or Nickname)
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.code === 'Escape') {
          target.blur();
        }
        return;
      }

      if (phase === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          startNewGameWithClass(selectedClass);
        }
        return;
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        if (inventoryOpen || statsOpen || shopOpen || activeDrawer !== 'none') {
          setInventoryOpen(false);
          setStatsOpen(false);
          setShopOpen(false);
          setActiveDrawer('none');
        } else if (phase === 'playing') {
          setEndSnapshot(buildSnapshot('victory', 0));
          setPhase('paused');
        } else if (phase === 'paused') {
          setPhase('playing');
        }
      } else if (e.code === 'KeyP' && activeDrawer === 'none') {
        e.preventDefault();
        if (phase === 'playing') {
          setEndSnapshot(buildSnapshot('victory', 0));
          setPhase('paused');
        } else if (phase === 'paused') {
          setPhase('playing');
        }
      } else if ((e.code === 'KeyV' || e.code === 'KeyI') && phase === 'playing') {
        e.preventDefault();
        setInventoryOpen((prev) => !prev);
      } else if (e.code === 'KeyC' && phase === 'playing') {
        e.preventDefault();
        setStatsOpen((prev) => {
          const next = !prev;
          if (next) setShopOpen(false);
          return next;
        });
      } else if (e.code === 'KeyB' && phase === 'playing') {
        e.preventDefault();
        handleApproachOrOpenShop();
      } else if (e.code === 'KeyO' && phase === 'playing') {
        e.preventDefault();
        setActiveDrawer((prev) => (prev === 'party' ? 'none' : 'party'));
      } else if (e.code === 'KeyK' && phase === 'playing') {
        e.preventDefault();
        setActiveDrawer((prev) => (prev === 'chaos_machine' ? 'none' : 'chaos_machine'));
      } else if (e.code === 'KeyT' && phase === 'playing') {
        e.preventDefault();
        setActiveDrawer((prev) => (prev === 'territory' ? 'none' : 'territory'));
      } else if ((e.code === 'BracketRight' || e.key === ']') && phase === 'playing') {
        e.preventDefault();
        handleToggleAutoHunt();
      } else if (e.code === 'KeyM' && phase === 'playing') {
        e.preventDefault();
        setMuted((prev) => {
          const next = !prev;
          soundEngine.muted = next;
          return next;
        });
      } else if (e.code === 'KeyR' && phase === 'playing' && activeDrawer === 'none') {
        e.preventDefault();
        engineActionsRef.current?.resetTerritoryArena(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [
    phase,
    inventoryOpen,
    statsOpen,
    shopOpen,
    activeDrawer,
    selectedClass,
    startNewGameWithClass,
    buildSnapshot,
    handleToggleAutoHunt,
    handleApproachOrOpenShop,
  ]);

  const handleEnemyKilled = useCallback(
    (expGain: number, isBoss: boolean, bloodCastleCleared: boolean) => {
      setPlayer((prev) => {
        const sameZoneAllies = getSameZonePartyAllies(
          partyMembersRef.current,
          partySelfIdRef.current,
          prev.territoryId,
          prev.inBloodCastle
        );
        const coopBonus = calculatePartyCoopExpBonus(expGain, sameZoneAllies.length);
        const { nextState, leveledUp } = grantExperience(prev, coopBonus.killerTotalExp);
        if (leveledUp) {
          soundEngine.playLevelUp();
        }
        const currTerritoryIdx = Math.max(
          0,
          TERRITORIES.findIndex((t) => t.id === prev.territoryId)
        );
        const unlockedIdx = isBoss
          ? Math.min(
              TERRITORIES.length - 1,
              Math.max(prev.highestReachedTerritoryIdx, currTerritoryIdx + 1)
            )
          : prev.highestReachedTerritoryIdx;

        return {
          ...nextState,
          killsInTerritory: prev.killsInTerritory + 1,
          totalKills: prev.totalKills + 1,
          bossesDefeated: prev.bossesDefeated + (isBoss ? 1 : 0),
          highestReachedTerritoryIdx: unlockedIdx,
        };
      });

      if (bloodCastleCleared) {
        setEndSnapshot((prevSnap) => prevSnap ?? buildSnapshot('victory', 0));
        setPhase('gameover');
      }
    },
    [buildSnapshot]
  );

  const handleLootCollected = useCallback((loot: LootDrop) => {
    setPlayer((prev) => {
      if (loot.type === 'zen') {
        return { ...prev, zen: prev.zen + (loot.amount ?? 50) };
      }
      if (loot.type === 'quest_item') {
        soundEngine.playLevelUp();
        return {
          ...prev,
          hasFirstProfQuestItem: true,
        };
      }
      if (loot.type === 'jewel_bless') {
        return {
          ...prev,
          jewels: { ...prev.jewels, bless: prev.jewels.bless + 1 },
        };
      }
      if (loot.type === 'jewel_soul') {
        return {
          ...prev,
          jewels: { ...prev.jewels, soul: prev.jewels.soul + 1 },
        };
      }
      if (loot.type === 'jewel_life') {
        return {
          ...prev,
          jewels: { ...prev.jewels, life: prev.jewels.life + 1 },
        };
      }
      if (loot.type === 'jewel_chaos') {
        return {
          ...prev,
          jewels: { ...prev.jewels, chaos: prev.jewels.chaos + 1 },
        };
      }
      if (loot.type === 'blood_scroll') {
        soundEngine.playJewelDrop();
        return {
          ...prev,
          bloodScrolls: prev.bloodScrolls + 1,
        };
      }
      if (loot.type === 'blood_fang') {
        soundEngine.playJewelDrop();
        return {
          ...prev,
          bloodFangs: prev.bloodFangs + 1,
        };
      }
      if (loot.type === 'equipment' && loot.equipment) {
        // If the naked hero picks up an equipment drop for an empty slot, auto-equip it!
        const dropSlot = loot.equipment.slot;
        if (prev.equipped[dropSlot] === null) {
          return {
            ...prev,
            equipped: {
              ...prev.equipped,
              [dropSlot]: loot.equipment,
            },
          };
        }
        if (prev.inventory.length >= 24) {
          return { ...prev, zen: prev.zen + loot.equipment.valueZen };
        }
        return {
          ...prev,
          inventory: [loot.equipment, ...prev.inventory],
        };
      }
      return prev;
    });
  }, []);

  const handleConsumeHpPotion = useCallback((): boolean => {
    let success = false;
    setPlayer((prev) => {
      if (prev.hpPotions <= 0) return prev;
      success = true;
      const nextCount = prev.hpPotions - 1;
      return { ...prev, hpPotions: nextCount, potions: nextCount };
    });
    return success || player.hpPotions > 0;
  }, [player.hpPotions]);

  const handleConsumeMpPotion = useCallback((): boolean => {
    let success = false;
    setPlayer((prev) => {
      if (prev.mpPotions <= 0) return prev;
      success = true;
      return { ...prev, mpPotions: prev.mpPotions - 1 };
    });
    return success || player.mpPotions > 0;
  }, [player.mpPotions]);

  const handleBuyPotions = (potionType: 'hp' | 'mp', packSize: 5 | 20): string => {
    const result = buyPotionsWithZen(player, potionType, packSize, hudSync.isNearShop);
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playJewelDrop();
    }
    return result.message;
  };

  const handleBuySkillBook = (skillId: string): string => {
    const result = buySkillBookWithZen(player, skillId, hudSync.isNearShop);
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playLevelUp();
    }
    return result.message;
  };

  const handleBuyShopEquipment = (catalogId: string): string => {
    const result = buyShopEquipmentToInventory(player, catalogId, hudSync.isNearShop);
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playJewelDrop();
    }
    return result.message;
  };

  const handlePlayerDefeated = useCallback(
    (bossHpRemaining: number) => {
      setEndSnapshot(buildSnapshot('defeat', bossHpRemaining));
      setPhase('gameover');
    },
    [buildSnapshot]
  );

  const handleAllocateStat = (stat: keyof CharacterAttributes, amount = 1) => {
    setPlayer((prev) => allocateStatPoint(prev, stat, amount));
  };

  const handleEquipItem = (item: EquipmentItem): string => {
    const result = equipItemFromInventory(player, item);
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playJewelDrop();
    }
    return result.message;
  };

  const handleUnequipSlot = (slot: ItemSlot): string => {
    const result = unequipItemToInventory(player, slot);
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playJewelDrop();
    }
    return result.message;
  };

  const handleSellItem = (item: EquipmentItem) => {
    setPlayer((prev) => ({
      ...prev,
      zen: prev.zen + item.valueZen,
      inventory: prev.inventory.filter((i) => i.id !== item.id),
    }));
  };

  const handleUpgradeWithJewel = (
    itemId: string,
    jewelType: 'bless' | 'soul' | 'life'
  ): string => {
    const result = upgradeItemWithJewel(player, itemId, jewelType, Math.random() * 0.6);
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playJewelDrop();
    }
    return result.message;
  };

  const handleCraftWings = (): string => {
    const result = craftChaosWings(player);
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playLevelUp();
    }
    return result.message;
  };

  const handleCraftBloodCastleTicket = (): string => {
    const result = craftBloodCastleTicket(player, Math.random());
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playLevelUp();
    }
    return result.message;
  };

  const handleEnterBloodCastle = (): string => {
    const result = enterBloodCastle(player);
    setPlayer(result.nextState);
    if (result.success) {
      setShopOpen(false);
      setActiveDrawer('none');
      soundEngine.playLevelUp();
      setTimeout(() => {
        engineActionsRef.current?.notifyStatusMessage(result.message, '#f43f5e');
      }, 60);
    }
    return result.message;
  };

  const handleExitBloodCastle = useCallback(() => {
    setPlayer((prev) => exitBloodCastle(prev));
    setActiveDrawer('none');
    setTimeout(() => {
      engineActionsRef.current?.notifyStatusMessage(
        'Вы вернулись из Blood Castle в город охоты.',
        '#38bdf8'
      );
    }, 60);
  }, []);

  const handleCompleteBloodCastleQuest = useCallback(() => {
    setPlayer((prev) => {
      const result = completeBloodCastleQuest(prev);
      soundEngine.playLevelUp();
      setTimeout(() => {
        engineActionsRef.current?.notifyStatusMessage(result.message, '#fbbf24');
      }, 40);
      return result.nextState;
    });
  }, []);

  const handleEvolveClass = (): string => {
    const result = evolveCharacterClass(player);
    setPlayer(result.nextState);
    if (result.success) {
      soundEngine.playLevelUp();
    }
    return result.message;
  };

  const handleGrandReset = (): string => {
    const result = performGrandReset(player);
    setPlayer(result.nextState);
    if (result.success) {
      setAutoHunt(false);
      soundEngine.playLevelUp();
    }
    return result.message;
  };

  const handleSelectTerritory = (territoryId: TerritoryId) => {
    setPlayer((prev) => ({
      ...prev,
      inBloodCastle: false,
      territoryId,
      killsInTerritory: 0,
    }));
    setActiveDrawer('none');
  };

  const currentClassDef = CLASSES[player.classId];

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#09080c] select-none">
      <GameCanvas
        phase={phase}
        player={player}
        autoHunt={autoHunt && player.level >= 5}
        hudRefs={hudRefs}
        engineActionsRef={engineActionsRef}
        partySelfId={partySelfId}
        localNickname={partyNickname}
        partyMembersRef={partyMembersRef}
        onPartySyncHero={handlePartySyncHero}
        onPartySyncZoneMonsters={handlePartySyncZoneMonsters}
        onPartyBroadcastAttack={handlePartyBroadcastAttack}
        onPartyBroadcastKill={handlePartyBroadcastKill}
        onEnemyKilled={handleEnemyKilled}
        onLootCollected={handleLootCollected}
        onConsumeHpPotion={handleConsumeHpPotion}
        onConsumeMpPotion={handleConsumeMpPotion}
        onPlayerDefeated={handlePlayerDefeated}
        onCompleteBloodCastleQuest={handleCompleteBloodCastleQuest}
        onOpenNpcModal={(npc) => {
          if (npc === 'chaos_goblin') {
            setActiveDrawer('chaos_machine');
          } else if (npc === 'portal_guard') {
            setActiveDrawer('territory');
          } else if (npc === 'priestess_sevina') {
            setShopOpen(false);
            setStatsOpen(true);
          } else {
            setStatsOpen(false);
            setShopOpen(true);
            setInventoryOpen(true);
          }
        }}
        onHudSync={setHudSync}
      />

      {phase === 'title' && (
        <TitleScreen
          selectedClass={selectedClass}
          onSelectClass={(clsId) => {
            setSelectedClass(clsId);
            setPlayer(createInitialPlayerState(clsId));
          }}
          onStartGame={() => startNewGameWithClass(selectedClass)}
        />
      )}

      {phase !== 'title' && (
        <>
          <HudOverlay
            player={player}
            hudRefs={hudRefs}
            muted={muted}
            bossActiveName={hudSync.bossActiveName}
            bossHpPct={hudSync.bossHpPct}
            bloodCastleInfo={hudSync.bloodCastleInfo ?? null}
            partySelfId={partySelfId}
            partyRoomCode={partyRoomCode}
            partyConnected={partyConnected}
            partyMembers={partyMembers}
            onOpenPartyModal={() =>
              setActiveDrawer((d) => (d === 'party' ? 'none' : 'party'))
            }
            onTeleportToAlly={handleTeleportToAlly}
            onExitBloodCastle={handleExitBloodCastle}
            onOpenStats={() => {
              setStatsOpen((prev) => {
                const next = !prev;
                if (next) setShopOpen(false);
                return next;
              });
            }}
            onOpenInventory={() => setInventoryOpen((prev) => !prev)}
            onOpenChaosMachine={() =>
              setActiveDrawer((d) => (d === 'chaos_machine' ? 'none' : 'chaos_machine'))
            }
            onOpenTerritory={() =>
              setActiveDrawer((d) => (d === 'territory' ? 'none' : 'territory'))
            }
            onToggleMute={() => {
              setMuted((prev) => {
                const next = !prev;
                soundEngine.muted = next;
                return next;
              });
            }}
            onTogglePause={() => {
              if (phase === 'playing') {
                setEndSnapshot(buildSnapshot('victory', 0));
                setPhase('paused');
              } else if (phase === 'paused') {
                setPhase('playing');
              }
            }}
            onRestart={() => {
              engineActionsRef.current?.resetTerritoryArena(true);
            }}
          />

          <MobileControls
            skills={currentClassDef.skills}
            classTier={player.classTier}
            playerLevel={player.level}
            learnedSkills={player.learnedSkills}
            hasWeapon={player.equipped.weapon !== null}
            cooldowns={hudSync.cooldowns}
            hpPotions={player.hpPotions}
            mpPotions={player.mpPotions}
            autoHunt={autoHunt && player.level >= 5}
            nearbyLootCount={hudSync.nearbyLootCount}
            comboStage={hudSync.comboStage}
            isNearShop={hudSync.isNearShop}
            onJoystickMove={(dx, dy) =>
              engineActionsRef.current?.setJoystickVector(dx, dy)
            }
            onPrimaryAttack={() => engineActionsRef.current?.triggerPrimaryAttack()}
            onUseSkill={(idx) => engineActionsRef.current?.triggerSkill(idx)}
            onUseHpPotion={() => engineActionsRef.current?.triggerHpPotion()}
            onUseMpPotion={() => engineActionsRef.current?.triggerMpPotion()}
            onApproachShop={handleApproachOrOpenShop}
            onPickupLoot={() => engineActionsRef.current?.triggerPickupNearbyLoot()}
            onToggleAutoHunt={handleToggleAutoHunt}
            onDash={() => engineActionsRef.current?.triggerDash()}
          />
        </>
      )}

      {phase === 'playing' && shopOpen && (
        <CityShopModal
          player={player}
          isNearShop={hudSync.isNearShop}
          activeDragPayload={activeDragPayload}
          onSetDragPayload={setActiveDragPayload}
          onSellInventoryItem={handleSellItem}
          onClose={() => setShopOpen(false)}
        />
      )}

      {phase === 'playing' && statsOpen && (
        <CharacterStatsModal
          player={player}
          onClose={() => setStatsOpen(false)}
          onAllocateStat={handleAllocateStat}
          onEvolveClass={handleEvolveClass}
          onGrandReset={handleGrandReset}
        />
      )}

      {phase === 'playing' && inventoryOpen && (
        <CharacterInventoryModal
          player={player}
          isNearShop={hudSync.isNearShop}
          shopOpen={shopOpen}
          activeDragPayload={activeDragPayload}
          onSetDragPayload={setActiveDragPayload}
          onOpenShop={handleApproachOrOpenShop}
          onClose={() => setInventoryOpen(false)}
          onEquipItem={handleEquipItem}
          onUnequipSlot={handleUnequipSlot}
          onSellItem={handleSellItem}
          onUpgradeWithJewel={handleUpgradeWithJewel}
          onBuyPotions={handleBuyPotions}
          onBuySkillBook={handleBuySkillBook}
          onBuyShopEquipment={handleBuyShopEquipment}
        />
      )}

      {phase === 'playing' && activeDrawer === 'chaos_machine' && (
        <ChaosMachineModal
          player={player}
          onClose={() => setActiveDrawer('none')}
          onUpgradeWithJewel={handleUpgradeWithJewel}
          onCraftWings={handleCraftWings}
          onCraftBloodCastleTicket={handleCraftBloodCastleTicket}
          onEnterBloodCastle={handleEnterBloodCastle}
        />
      )}

      {phase === 'playing' && activeDrawer === 'territory' && (
        <TerritoryModal
          player={player}
          onClose={() => setActiveDrawer('none')}
          onSelectTerritory={handleSelectTerritory}
          onEnterBloodCastle={handleEnterBloodCastle}
          onExitBloodCastle={handleExitBloodCastle}
        />
      )}

      {phase === 'playing' && activeDrawer === 'party' && (
        <PartyCoopModal
          player={player}
          selfId={partySelfId}
          nickname={partyNickname}
          roomCode={partyRoomCode}
          wsConnected={partyConnected}
          partyMembers={partyMembers}
          chatMessages={partyChatMessages}
          errorMessage={partyError}
          onUpdateIdentity={handleUpdatePartyIdentity}
          onSendChat={handleSendPartyChat}
          onTeleportToAlly={handleTeleportToAlly}
          onClose={() => setActiveDrawer('none')}
        />
      )}

      {(phase === 'paused' || phase === 'gameover') && endSnapshot && (
        <StatusModal
          mode={phase}
          snapshot={endSnapshot}
          onResume={
            phase === 'paused'
              ? () => {
                  setPhase('playing');
                }
              : undefined
          }
          onRestart={() => {
            setPhase('playing');
            setEndSnapshot(null);
            engineActionsRef.current?.resetTerritoryArena(true);
          }}
          onReturnTitle={() => {
            setPhase('title');
            setInventoryOpen(false);
            setStatsOpen(false);
            setShopOpen(false);
            setActiveDrawer('none');
          }}
        />
      )}
    </main>
  );
}
