export type CharacterClassId = 'dark_knight' | 'dark_wizard' | 'fairy_elf';

export type ClassTier = 1 | 2 | 3;

export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

export type TerritoryId =
  | 'lorencia'
  | 'noria'
  | 'elbeland'
  | 'devias'
  | 'dungeon'
  | 'atlans'
  | 'lost_tower'
  | 'tarkan'
  | 'icarus'
  | 'kalima'
  | 'valley_of_loren'
  | 'crywolf'
  | 'aida'
  | 'kanturu_ruins'
  | 'kanturu_relics'
  | 'barrack_of_balgass'
  | 'karutan'
  | 'raklion'
  | 'swamp_of_calmness'
  | 'vulcanus'
  | 'acheron'
  | 'ferea'
  | 'nixies_lake'
  | 'blood_castle';

export type ItemSlot = 'weapon' | 'armor' | 'helm' | 'wings' | 'ring' | 'pendant';

export type ItemRarity = 'normal' | 'magic' | 'excellent' | 'ancient';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  level: number; // +0 to +15
  lifeOption: number; // +0, +4, +8, +12, +16, +20, +24, +28 (Jewel of Life)
  baseAttack: number;
  baseDefense: number;
  critChanceBonus: number;
  moveSpeedBonus: number;
  setName?: string; // e.g., 'Hyon Dragon', 'Anubis Legendary', 'Gywen Guardian'
  classRestriction?: CharacterClassId;
  excellentOption?: string;
  valueZen: number;
}

export interface CharacterAttributes {
  str: number; // Сила: physical damage
  agi: number; // Ловкость: defense, attack speed, crit
  vit: number; // Живучесть: max HP
  ene: number; // Энергия: skill power, max MP
}

export interface SkillDefinition {
  id: string;
  name: string;
  bookName: string;
  requiredLevel: number;
  bookPriceZen: number;
  roleClue: string;
  keyBinding: string;
  manaCost: number;
  cooldownSec: number;
  damageMultiplier: number;
  range: number;
  aoeRadius: number;
  requiredTier?: ClassTier;
  pattern:
    | 'melee_arc'
    | 'spin_aoe'
    | 'ground_slam'
    | 'combo_nova'
    | 'dark_beam'
    | 'evil_spirits'
    | 'meteor_strike'
    | 'soul_supernova'
    | 'triple_arrow'
    | 'ice_arrow'
    | 'guardian_buff'
    | 'infinity_arrow_storm';
  color: string;
}

export interface ClassDefinition {
  id: CharacterClassId;
  name: string;
  tierTitles: Record<ClassTier, string>;
  setName: string;
  loreShort: string;
  accentColor: string;
  secondaryColor: string;
  baseAttributes: CharacterAttributes;
  skills: SkillDefinition[];
  startingWeapon: EquipmentItem;
  startingArmor: EquipmentItem;
  startingHelm: EquipmentItem;
}

export type EnemyArchetype =
  | 'swarmer_skeleton'
  | 'kiter_lich'
  | 'charger_bull'
  | 'orbiter_gorgon'
  | 'bc_gate'
  | 'bc_statue';

export type BloodCastleStage =
  | 'kill_100'
  | 'break_gates'
  | 'destroy_statue'
  | 'return_weapon'
  | 'completed';

export interface EnemyEntity {
  id: string;
  name: string;
  archetype: EnemyArchetype;
  isBoss: boolean;
  isQuestMonster?: boolean;
  isStructure?: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  campX?: number;
  campY?: number;
  slotId?: string;
  respawnAtGameTimeSec?: number;
  radius: number;
  hp: number;
  maxHp: number;
  attackDamage: number;
  moveSpeed: number;
  attackRange: number;
  expReward: number;
  zenReward: number;
  color: string;
  // AI & telegraph state
  aiState: 'move' | 'windup' | 'active' | 'recover' | 'ko';
  stateTimer: number;
  telegraphX: number;
  telegraphY: number;
  facingAngle: number;
  walkDistance: number;
  hitFlashTimer: number;
  chillTimer: number;
  koTimer: number;
  orbitDirection: number;
}

export type LootDropType =
  | 'zen'
  | 'jewel_bless'
  | 'jewel_soul'
  | 'jewel_life'
  | 'jewel_chaos'
  | 'equipment'
  | 'potion_hp'
  | 'potion_mp'
  | 'quest_item'
  | 'blood_scroll'
  | 'blood_fang'
  | 'archangel_weapon';

export const GROUND_LOOT_TTL_MS = 60_000; // Ровно 1 минута (60 секунд)

export interface LootDrop {
  id: string;
  type: LootDropType;
  label: string;
  x: number;
  y: number;
  amount?: number;
  equipment?: EquipmentItem;
  rarityColor: string;
  spawnTime: number;
  expiresAtMs?: number;
  droppedByNickname?: string;
}

export interface HuntingCampDefinition {
  x: number;
  y: number;
  title: string;
  isVip: boolean;
  baseMonsterCount: number;
  vipExtraRangedCount: number;
}

export interface MapTrailSegment {
  points: { x: number; y: number }[];
  width: number;
  style: 'dirt_trail' | 'cobblestone_road' | 'forest_path';
}

export interface MapRiverStream {
  points: { x: number; y: number }[];
  width: number;
  waterColor: string;
  foamColor: string;
  bridges: { x: number; y: number; angle: number; width: number; length: number }[];
}

export interface MapFenceLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  style: 'wood_fence' | 'iron_railing' | 'stone_wall';
}

export interface MapSceneryProp {
  x: number;
  y: number;
  kind: 'oak_tree' | 'pine_tree' | 'cart' | 'barrel_cluster' | 'signpost' | 'well' | 'campfire';
  label?: string;
}

export interface TerritoryMapLayout {
  territoryId: TerritoryId;
  biomeTheme: 'lorencia_pasture' | 'noria_forest' | 'elbeland_marsh' | 'devias_snow' | 'gothic_wilderness';
  camps: HuntingCampDefinition[];
  trails: MapTrailSegment[];
  rivers: MapRiverStream[];
  fences: MapFenceLine[];
  props: MapSceneryProp[];
}

export interface TerritoryDefinition {
  id: TerritoryId;
  name: string;
  subtitle: string;
  recommendedLevel: number;
  groundColor: string;
  tileAccentColor: string;
  gridColor: string;
  accentColor: string;
  enemyLevelMultiplier: number;
  targetKillsForBoss: number;
  bossName: string;
}

export interface DerivedStats {
  maxHp: number;
  maxMp: number;
  minDamage: number;
  maxDamage: number;
  defense: number;
  critChance: number;
  doubleDamageChance: number;
  moveSpeed: number;
  combatPower: number;
  activeSetPieceCount: number;
  activeSetName: string;
}

export interface PlayerProgressState {
  classId: CharacterClassId;
  classTier: ClassTier;
  resets: number;
  level: number;
  exp: number;
  expToNext: number;
  statPoints: number;
  attributes: CharacterAttributes;
  zen: number;
  jewels: {
    bless: number;
    soul: number;
    life: number;
    chaos: number;
  };
  potions: number; // Mirror of hpPotions for legacy compatibility
  hpPotions: number;
  mpPotions: number;
  hasFirstProfQuestItem: boolean;
  bloodScrolls: number; // Кровавый Свиток (Scroll of Archangel / Blood Scroll)
  bloodFangs: number; // Кровавый Клык (Blood Bone / Blood Fang)
  bloodCastleTickets: number; // Билет в Blood Castle (Invisibility Cloak)
  inBloodCastle: boolean; // Находится ли герой в отдельной ивент-зоне Blood Castle
  bloodCastleClears: number; // Сколько раз пройден ивент Blood Castle
  learnedSkills: string[];
  equipped: {
    weapon: EquipmentItem | null;
    armor: EquipmentItem | null;
    helm: EquipmentItem | null;
    wings: EquipmentItem | null;
    ring: EquipmentItem | null;
    pendant: EquipmentItem | null;
  };
  inventory: EquipmentItem[];
  territoryId: TerritoryId;
  killsInTerritory: number;
  totalKills: number;
  bossesDefeated: number;
  highestReachedTerritoryIdx: number;
}

export interface EndOfRunSnapshot {
  outcome: 'victory' | 'defeat';
  classId: CharacterClassId;
  level: number;
  territoryName: string;
  totalKills: number;
  bossesDefeated: number;
  zenCollected: number;
  combatPower: number;
  clearTimeSec: number;
  bossHpRemaining: number;
}

export interface PartyMemberState {
  id: string;
  nickname: string;
  roomCode: string;
  classId: CharacterClassId;
  classTier: ClassTier;
  level: number;
  resets: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  territoryId: TerritoryId;
  inBloodCastle: boolean;
  x: number;
  y: number;
  facingAngle: number;
  walkDistance: number;
  hasWeapon: boolean;
  hasWings: boolean;
  activeSkillPattern: SkillDefinition['pattern'] | 'primary' | null;
  activeSkillColor: string;
  activeSkillTimestamp: number;
  chatBubbleText?: string;
  chatBubbleExpiresAt?: number;
  lastUpdatedAt: number;
}

export interface PartyAttackEvent {
  attackerId: string;
  nickname: string;
  classId: CharacterClassId;
  territoryId: TerritoryId;
  inBloodCastle: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facingAngle: number;
  pattern: SkillDefinition['pattern'] | 'primary';
  skillColor: string;
  damage: number;
  aoeRadius: number;
  hitEnemyIds?: string[];
  timestamp: number;
}

export interface PartyKillShareEvent {
  killerId: string;
  killerNickname: string;
  territoryId: TerritoryId;
  inBloodCastle: boolean;
  enemyId?: string;
  respawnAtGameTimeSec?: number;
  monsterName: string;
  isBoss: boolean;
  expShare: number;
  zenShare: number;
  x: number;
  y: number;
  timestamp: number;
}

export interface SharedMonsterState {
  id: string;
  name: string;
  archetype: EnemyArchetype;
  isBoss: boolean;
  isStructure?: boolean;
  isQuestMonster?: boolean;
  x: number;
  y: number;
  campX?: number;
  campY?: number;
  radius: number;
  hp: number;
  maxHp: number;
  attackDamage: number;
  moveSpeed: number;
  attackRange: number;
  expReward: number;
  zenReward: number;
  color: string;
  aiState: 'move' | 'windup' | 'active' | 'recover' | 'ko';
  telegraphX: number;
  telegraphY: number;
  facingAngle: number;
  walkDistance: number;
  chillTimer: number;
  orbitDirection: 1 | -1;
}

export interface PartyZoneMonsterSnapshot {
  hostId: string;
  territoryId: TerritoryId;
  inBloodCastle: boolean;
  bossSpawnedForTerritory: boolean;
  bcStage: BloodCastleStage;
  bcBridgeKills: number;
  monsters: SharedMonsterState[];
  deadMonsterRespawns?: Record<string, number>;
  timestamp: number;
}

export interface PartyChatMessage {
  id: string;
  senderId: string;
  nickname: string;
  classId: CharacterClassId;
  territoryId?: TerritoryId;
  inBloodCastle?: boolean;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface TradeJewelOffer {
  bless: number;
  soul: number;
  life: number;
  chaos: number;
}

export interface TradeSideOffer {
  zen: number;
  items: EquipmentItem[];
  jewels: TradeJewelOffer;
  locked: boolean;
}

export interface PlayerTradeSession {
  tradeId: string;
  initiatorId: string;
  initiatorNickname: string;
  targetId: string;
  targetNickname: string;
  territoryId: TerritoryId;
  inBloodCastle: boolean;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  offers: Record<string, TradeSideOffer>;
}



