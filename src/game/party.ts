import {
  BloodCastleStage,
  CharacterClassId,
  ClassTier,
  EnemyArchetype,
  EquipmentItem,
  GROUND_LOOT_TTL_MS,
  ItemRarity,
  ItemSlot,
  LootDrop,
  LootDropType,
  PartyMemberState,
  SharedMonsterState,
  SkillDefinition,
  TerritoryId,
  TradeJewelOffer,
  TradeSideOffer,
} from './types';

export const MAX_PARTY_SIZE = 5;
export const DEFAULT_PARTY_ROOM = 'MU-1';
export const MAX_SHARED_MONSTERS = 96;
export const INDIVIDUAL_MONSTER_RESPAWN_SEC = 14;

/**
 * Persistent MU Continent Epoch (runs continuously on real UTC wall-clock time
 * regardless of whether the player is online or offline).
 */
export const MU_WORLD_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

/**
 * Returns the persistent MU World Game Time in seconds (with sub-second precision).
 * Advances continuously in real time even when the player closes the game.
 */
export function getWorldGameTimeSec(nowMs = Date.now()): number {
  return Math.max(0, (nowMs - MU_WORLD_EPOCH_MS) / 1000);
}

/**
 * Formats persistent MU World Game Time into a 24-hour in-game fantasy clock & day cycle.
 * 1 real minute = 1 in-game hour (24 real minutes = 1 full MU day/night cycle).
 */
export function formatWorldGameClock(nowMs = Date.now()): {
  gameTimeSec: number;
  dayNumber: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedTime: string;
  phaseLabel: string;
  isNight: boolean;
} {
  const gameTimeSec = getWorldGameTimeSec(nowMs);
  // 1 real second = 1 in-game minute -> 1440 real seconds (24 min) = 1 full 24h in-game day
  const totalInGameMinutes = Math.floor(gameTimeSec);
  const inGameSeconds = Math.floor((gameTimeSec - totalInGameMinutes) * 60);
  const dayNumber = Math.floor(totalInGameMinutes / 1440) + 1;
  const minuteOfDay = ((totalInGameMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(minuteOfDay / 60);
  const minutes = minuteOfDay % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(inGameSeconds).padStart(2, '0');
  const isNight = hours < 6 || hours >= 20;
  const phaseLabel =
    hours >= 6 && hours < 12
      ? '🌅 Утро'
      : hours >= 12 && hours < 18
        ? '☀️ День'
        : hours >= 18 && hours < 21
          ? '🌇 Сумерки'
          : '🌙 Ночь';

  return {
    gameTimeSec,
    dayNumber,
    hours,
    minutes,
    seconds: inGameSeconds,
    formattedTime: `${hh}:${mm}:${ss}`,
    phaseLabel,
    isNight,
  };
}

/**
 * Computes the remaining lifetime in seconds for an item lying on the ground (exact 60s TTL).
 */
export function getGroundLootRemainingSec(drop: Pick<LootDrop, 'spawnTime' | 'expiresAtMs'>, nowMs = Date.now()): number {
  const expiresAt = drop.expiresAtMs ?? drop.spawnTime + GROUND_LOOT_TTL_MS;
  return Math.max(0, Math.ceil((expiresAt - nowMs) / 1000));
}

export function isGroundLootExpired(drop: Pick<LootDrop, 'spawnTime' | 'expiresAtMs'>, nowMs = Date.now()): boolean {
  const expiresAt = drop.expiresAtMs ?? drop.spawnTime + GROUND_LOOT_TTL_MS;
  return nowMs >= expiresAt;
}

const VALID_CLASSES: ReadonlySet<CharacterClassId> = new Set([
  'dark_knight',
  'dark_wizard',
  'fairy_elf',
]);

const VALID_TERRITORIES: ReadonlySet<TerritoryId> = new Set([
  'lorencia',
  'noria',
  'elbeland',
  'devias',
  'dungeon',
  'atlans',
  'lost_tower',
  'tarkan',
  'icarus',
  'kalima',
  'valley_of_loren',
  'crywolf',
  'aida',
  'kanturu_ruins',
  'kanturu_relics',
  'barrack_of_balgass',
  'karutan',
  'raklion',
  'swamp_of_calmness',
  'vulcanus',
  'acheron',
  'ferea',
  'nixies_lake',
  'blood_castle',
]);

const VALID_PATTERNS: ReadonlySet<SkillDefinition['pattern'] | 'primary'> = new Set([
  'primary',
  'melee_arc',
  'spin_aoe',
  'ground_slam',
  'combo_nova',
  'dark_beam',
  'evil_spirits',
  'meteor_strike',
  'soul_supernova',
  'triple_arrow',
  'ice_arrow',
  'guardian_buff',
  'infinity_arrow_storm',
]);

/**
 * Sanitizes a party room code into a safe uppercase alphanumeric identifier (3..16 chars).
 */
export function sanitizePartyCode(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_PARTY_ROOM;
  const cleaned = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 16);
  return cleaned.length >= 2 ? cleaned : DEFAULT_PARTY_ROOM;
}

/**
 * Sanitizes a player nickname (strips control chars and angle brackets, caps at 18 chars).
 */
export function sanitizePlayerNickname(raw: unknown, fallback = 'Герой-MU'): string {
  if (typeof raw !== 'string') return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .trim()
    .slice(0, 18);
  return cleaned.length >= 2 ? cleaned : fallback;
}

/**
 * Sanitizes a party chat message (strips control chars, caps at 140 chars).
 */
export function sanitizePartyChatText(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 140);
}

export function clampCoord(val: unknown, min = -5500, max = 5500): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return 0;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export function clampPositiveInt(val: unknown, fallback: number, max = 10_000_000): number {
  const num = Number(val);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return Math.min(max, Math.round(num));
}

export function sanitizeClassId(raw: unknown): CharacterClassId {
  if (typeof raw === 'string' && VALID_CLASSES.has(raw as CharacterClassId)) {
    return raw as CharacterClassId;
  }
  return 'dark_knight';
}

export function sanitizeClassTier(raw: unknown): ClassTier {
  const num = Number(raw);
  if (num === 2 || num === 3) return num;
  return 1;
}

export function sanitizeTerritoryId(raw: unknown): TerritoryId {
  if (typeof raw === 'string' && VALID_TERRITORIES.has(raw as TerritoryId)) {
    return raw as TerritoryId;
  }
  return 'lorencia';
}

export function sanitizeSkillPattern(
  raw: unknown
): SkillDefinition['pattern'] | 'primary' | null {
  if (typeof raw === 'string' && VALID_PATTERNS.has(raw as SkillDefinition['pattern'] | 'primary')) {
    return raw as SkillDefinition['pattern'] | 'primary';
  }
  return null;
}

/**
 * Calculates MU Online Party Co-op EXP Bonus when hunting in the same zone with party friends.
 * - Each additional party ally in the same territory/Blood Castle grants +20% EXP bonus to the killer
 *   (up to +80% in a full 5-player party).
 * - Each party ally in the same territory/Blood Castle also receives 65% of the monster's base EXP
 *   and 50% of its Zen as shared party loot!
 */
export function calculatePartyCoopExpBonus(
  baseExp: number,
  sameZoneAlliesCount: number
): {
  killerTotalExp: number;
  sharedAllyExp: number;
  bonusPct: number;
} {
  const clampedAllies = Math.max(0, Math.min(MAX_PARTY_SIZE - 1, Math.floor(sameZoneAlliesCount)));
  if (clampedAllies === 0) {
    return {
      killerTotalExp: Math.max(1, Math.round(baseExp)),
      sharedAllyExp: 0,
      bonusPct: 0,
    };
  }
  const bonusPct = clampedAllies * 20;
  const killerTotalExp = Math.max(1, Math.round(baseExp * (1 + bonusPct / 100)));
  const sharedAllyExp = Math.max(1, Math.round(baseExp * (0.65 + clampedAllies * 0.05)));
  return {
    killerTotalExp,
    sharedAllyExp,
    bonusPct,
  };
}

/**
 * Filters party members that are currently in the same active zone (same territoryId and Blood Castle state).
 */
export function getSameZonePartyAllies(
  allies: Iterable<PartyMemberState>,
  localId: string,
  territoryId: TerritoryId,
  inBloodCastle: boolean
): PartyMemberState[] {
  const result: PartyMemberState[] = [];
  for (const member of allies) {
    if (member.id === localId) continue;
    if (inBloodCastle) {
      if (member.inBloodCastle) {
        result.push(member);
      }
    } else if (!member.inBloodCastle && member.territoryId === territoryId) {
      result.push(member);
    }
  }
  return result;
}

export function getPartyZoneKey(territoryId: TerritoryId, inBloodCastle: boolean): string {
  return inBloodCastle ? 'blood_castle_event' : territoryId;
}

/**
 * Deterministically elects the Zone Host ID among all connected party members in the same zone.
 * Every player in the same zone (and the server) computes the exact same hostId so only one
 * client runs authoritative monster spawning & AI while all peers see and hit the exact same monsters.
 */
export function electZoneHostId(
  members: Iterable<PartyMemberState>,
  localId: string,
  territoryId: TerritoryId,
  inBloodCastle: boolean
): string {
  const sameZoneIds: string[] = [];
  if (localId) {
    sameZoneIds.push(localId);
  }
  for (const member of members) {
    if (!member.id || member.id === localId) continue;
    const isSame = inBloodCastle
      ? Boolean(member.inBloodCastle)
      : !member.inBloodCastle && member.territoryId === territoryId;
    if (isSame) {
      sameZoneIds.push(member.id);
    }
  }
  if (sameZoneIds.length === 0) return localId;
  sameZoneIds.sort();
  return sameZoneIds[0];
}

const VALID_ARCHETYPES: ReadonlySet<EnemyArchetype> = new Set([
  'swarmer_skeleton',
  'kiter_lich',
  'charger_bull',
  'orbiter_gorgon',
  'bc_gate',
  'bc_statue',
]);

const VALID_AI_STATES: ReadonlySet<SharedMonsterState['aiState']> = new Set([
  'move',
  'windup',
  'active',
  'recover',
  'ko',
]);

const VALID_BC_STAGES: ReadonlySet<BloodCastleStage> = new Set([
  'kill_100',
  'break_gates',
  'destroy_statue',
  'return_weapon',
  'completed',
]);

export function sanitizeBloodCastleStage(raw: unknown): BloodCastleStage {
  if (typeof raw === 'string' && VALID_BC_STAGES.has(raw as BloodCastleStage)) {
    return raw as BloodCastleStage;
  }
  return 'kill_100';
}

export function sanitizeEnemyId(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 64);
}

export function sanitizeHitEnemyIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const result: string[] = [];
  for (let i = 0; i < Math.min(raw.length, 32); i++) {
    const id = sanitizeEnemyId(raw[i]);
    if (id) result.push(id);
  }
  return result;
}

export function sanitizeDeadMonsterRespawns(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const result: Record<string, number> = {};
  const entries = Object.entries(raw as Record<string, unknown>);
  for (let i = 0; i < Math.min(entries.length, MAX_SHARED_MONSTERS); i++) {
    const [rawKey, rawVal] = entries[i];
    const id = sanitizeEnemyId(rawKey);
    const num = Number(rawVal);
    if (id && Number.isFinite(num) && num > 0) {
      result[id] = Math.round(num * 100) / 100;
    }
  }
  return result;
}

export function sanitizeSharedMonsterList(raw: unknown): SharedMonsterState[] {
  if (!Array.isArray(raw)) return [];
  const list: SharedMonsterState[] = [];
  const count = Math.min(raw.length, MAX_SHARED_MONSTERS);
  for (let i = 0; i < count; i++) {
    const item = raw[i] as Record<string, unknown> | null;
    if (!item || typeof item !== 'object') continue;
    const id = sanitizeEnemyId(item.id);
    if (!id) continue;

    const archetype: EnemyArchetype =
      typeof item.archetype === 'string' && VALID_ARCHETYPES.has(item.archetype as EnemyArchetype)
        ? (item.archetype as EnemyArchetype)
        : 'swarmer_skeleton';

    const aiState: SharedMonsterState['aiState'] =
      typeof item.aiState === 'string' &&
      VALID_AI_STATES.has(item.aiState as SharedMonsterState['aiState'])
        ? (item.aiState as SharedMonsterState['aiState'])
        : 'move';

    const name =
      typeof item.name === 'string'
        ? item.name.replace(/[\u0000-\u001F<>]/g, '').slice(0, 64)
        : 'Монстр';

    const color =
      typeof item.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(item.color)
        ? item.color
        : '#d6d3d1';

    const maxHp = Math.max(1, clampPositiveInt(item.maxHp, 175, 500_000_000));
    const hp = Math.min(maxHp, clampPositiveInt(item.hp, maxHp, 500_000_000));
    const x = clampCoord(item.x);
    const y = clampCoord(item.y);

    list.push({
      id,
      name,
      archetype,
      isBoss: Boolean(item.isBoss),
      isStructure: Boolean(item.isStructure),
      isQuestMonster: Boolean(item.isQuestMonster),
      x,
      y,
      campX: item.campX !== undefined ? clampCoord(item.campX) : x,
      campY: item.campY !== undefined ? clampCoord(item.campY) : y,
      radius: Math.max(12, Math.min(90, clampPositiveInt(item.radius, 20, 90))),
      hp,
      maxHp,
      attackDamage: clampPositiveInt(item.attackDamage, 30, 50_000_000),
      moveSpeed: Math.max(0, Math.min(450, clampPositiveInt(item.moveSpeed, 120, 450))),
      attackRange: Math.max(0, Math.min(600, clampPositiveInt(item.attackRange, 56, 600))),
      expReward: clampPositiveInt(item.expReward, 68, 50_000_000),
      zenReward: clampPositiveInt(item.zenReward, 115, 10_000_000),
      color,
      aiState,
      telegraphX: clampCoord(item.telegraphX ?? x),
      telegraphY: clampCoord(item.telegraphY ?? y),
      facingAngle: Number.isFinite(Number(item.facingAngle)) ? Number(item.facingAngle) : 0,
      walkDistance: clampPositiveInt(item.walkDistance, 0, 10_000_000),
      chillTimer: Number.isFinite(Number(item.chillTimer))
        ? Math.max(0, Math.min(10, Number(item.chillTimer)))
        : 0,
      orbitDirection: Number(item.orbitDirection) === -1 ? -1 : 1,
    });
  }
  return list;
}

const VALID_SLOTS: ReadonlySet<ItemSlot> = new Set([
  'weapon',
  'armor',
  'helm',
  'wings',
  'ring',
  'pendant',
]);

const VALID_RARITIES: ReadonlySet<ItemRarity> = new Set([
  'normal',
  'magic',
  'excellent',
  'ancient',
]);

const VALID_LOOT_TYPES: ReadonlySet<LootDropType> = new Set([
  'zen',
  'jewel_bless',
  'jewel_soul',
  'jewel_life',
  'jewel_chaos',
  'equipment',
  'potion_hp',
  'potion_mp',
  'quest_item',
  'blood_scroll',
  'blood_fang',
  'archangel_weapon',
]);

export function sanitizeEquipmentItem(raw: unknown): EquipmentItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const id = sanitizeEnemyId(obj.id);
  if (!id) return null;
  const slot: ItemSlot =
    typeof obj.slot === 'string' && VALID_SLOTS.has(obj.slot as ItemSlot)
      ? (obj.slot as ItemSlot)
      : 'weapon';
  const rarity: ItemRarity =
    typeof obj.rarity === 'string' && VALID_RARITIES.has(obj.rarity as ItemRarity)
      ? (obj.rarity as ItemRarity)
      : 'normal';
  const name =
    typeof obj.name === 'string'
      ? obj.name.replace(/[\u0000-\u001F<>]/g, '').trim().slice(0, 64) || 'Предмет'
      : 'Предмет';
  const setName =
    typeof obj.setName === 'string'
      ? obj.setName.replace(/[\u0000-\u001F<>]/g, '').trim().slice(0, 48) || undefined
      : undefined;
  const excellentOption =
    typeof obj.excellentOption === 'string'
      ? obj.excellentOption.replace(/[\u0000-\u001F<>]/g, '').trim().slice(0, 64) || undefined
      : undefined;
  const classRestriction =
    typeof obj.classRestriction === 'string' && VALID_CLASSES.has(obj.classRestriction as CharacterClassId)
      ? (obj.classRestriction as CharacterClassId)
      : undefined;

  return {
    id,
    name,
    slot,
    rarity,
    level: Math.max(0, Math.min(15, clampPositiveInt(obj.level, 0, 15))),
    lifeOption: Math.max(0, Math.min(28, clampPositiveInt(obj.lifeOption, 0, 28))),
    baseAttack: clampPositiveInt(obj.baseAttack, 0, 5_000_000),
    baseDefense: clampPositiveInt(obj.baseDefense, 0, 5_000_000),
    critChanceBonus: Math.max(0, Math.min(80, clampPositiveInt(obj.critChanceBonus, 0, 80))),
    moveSpeedBonus: Math.max(0, Math.min(120, clampPositiveInt(obj.moveSpeedBonus, 0, 120))),
    setName,
    classRestriction,
    excellentOption,
    valueZen: clampPositiveInt(obj.valueZen, 100, 50_000_000),
  };
}

export function sanitizeGroundLootDrop(raw: unknown, nowMs = Date.now()): LootDrop | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const id = sanitizeEnemyId(obj.id);
  if (!id) return null;
  const type: LootDropType =
    typeof obj.type === 'string' && VALID_LOOT_TYPES.has(obj.type as LootDropType)
      ? (obj.type as LootDropType)
      : 'equipment';
  const label =
    typeof obj.label === 'string'
      ? obj.label.replace(/[\u0000-\u001F<>]/g, '').trim().slice(0, 72) || 'Предмет'
      : 'Предмет';
  const rarityColor =
    typeof obj.rarityColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(obj.rarityColor)
      ? obj.rarityColor
      : '#fbbf24';
  const equipment = type === 'equipment' ? sanitizeEquipmentItem(obj.equipment) ?? undefined : undefined;
  if (type === 'equipment' && !equipment) return null;

  return {
    id,
    type,
    label,
    x: clampCoord(obj.x),
    y: clampCoord(obj.y),
    amount: obj.amount !== undefined ? clampPositiveInt(obj.amount, 1, 50_000_000) : undefined,
    equipment,
    rarityColor,
    spawnTime: nowMs,
    expiresAtMs: nowMs + GROUND_LOOT_TTL_MS,
    droppedByNickname:
      typeof obj.droppedByNickname === 'string'
        ? sanitizePlayerNickname(obj.droppedByNickname)
        : undefined,
  };
}

export function sanitizeTradeJewels(raw: unknown): TradeJewelOffer {
  if (!raw || typeof raw !== 'object') {
    return { bless: 0, soul: 0, life: 0, chaos: 0 };
  }
  const obj = raw as Record<string, unknown>;
  return {
    bless: clampPositiveInt(obj.bless, 0, 9999),
    soul: clampPositiveInt(obj.soul, 0, 9999),
    life: clampPositiveInt(obj.life, 0, 9999),
    chaos: clampPositiveInt(obj.chaos, 0, 9999),
  };
}

export function sanitizeTradeSideOffer(raw: unknown): TradeSideOffer {
  if (!raw || typeof raw !== 'object') {
    return {
      zen: 0,
      items: [],
      jewels: { bless: 0, soul: 0, life: 0, chaos: 0 },
      locked: false,
    };
  }
  const obj = raw as Record<string, unknown>;
  const rawItems = Array.isArray(obj.items) ? obj.items : [];
  const items: EquipmentItem[] = [];
  const seenIds = new Set<string>();
  for (let i = 0; i < Math.min(rawItems.length, 8); i++) {
    const it = sanitizeEquipmentItem(rawItems[i]);
    if (it && !seenIds.has(it.id)) {
      seenIds.add(it.id);
      items.push(it);
    }
  }
  return {
    zen: clampPositiveInt(obj.zen, 0, 100_000_000),
    items,
    jewels: sanitizeTradeJewels(obj.jewels),
    locked: Boolean(obj.locked),
  };
}


