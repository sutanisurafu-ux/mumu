import {
  CharacterAttributes,
  CharacterClassId,
  ClassDefinition,
  ClassTier,
  DerivedStats,
  EquipmentItem,
  HuntingCampDefinition,
  ItemRarity,
  ItemSlot,
  MapFenceLine,
  MapRiverStream,
  MapSceneryProp,
  MapTrailSegment,
  PlayerProgressState,
  TerritoryDefinition,
  TerritoryId,
  TerritoryMapLayout,
} from './types';

export const TERRITORIES: TerritoryDefinition[] = [
  {
    id: 'lorencia',
    name: '1. Город Лоренсия (Lorencia)',
    subtitle: 'Имперская столица рыцарей, Лавка Ханзо и первые лагеря Скелетов',
    recommendedLevel: 1,
    groundColor: '#141915',
    tileAccentColor: '#1c241e',
    gridColor: 'rgba(195, 165, 100, 0.09)',
    accentColor: '#d4a853',
    enemyLevelMultiplier: 1.0,
    targetKillsForBoss: 20,
    bossName: 'Король Скелетов Лоренсии',
  },
  {
    id: 'noria',
    name: '2. Лесной Город Нория (Noria)',
    subtitle: 'Изумрудный полис эльфов и рощи тяжёлых Каменных Големов (×2.6 мощь врагов)',
    recommendedLevel: 12,
    groundColor: '#0f1c16',
    tileAccentColor: '#162920',
    gridColor: 'rgba(52, 211, 153, 0.1)',
    accentColor: '#34d399',
    enemyLevelMultiplier: 2.6,
    targetKillsForBoss: 22,
    bossName: 'Древний Титан Нории',
  },
  {
    id: 'elbeland',
    name: '3. Бастион Эльбеланд (Elbeland)',
    subtitle: 'Туманный город призывателей, руины озера и проклятые Тотемы (×5.2 мощь врагов)',
    recommendedLevel: 24,
    groundColor: '#171524',
    tileAccentColor: '#211e33',
    gridColor: 'rgba(192, 132, 252, 0.11)',
    accentColor: '#c084fc',
    enemyLevelMultiplier: 5.2,
    targetKillsForBoss: 24,
    bossName: 'Проклятый Волк Эльбеланда',
  },
  {
    id: 'devias',
    name: '4. Снежная Крепость Девиас (Devias)',
    subtitle: 'Северная цитадель гильдий, Собор Жрицы Себины и ледяные рыцари (×9.5 мощь врагов)',
    recommendedLevel: 36,
    groundColor: '#111b24',
    tileAccentColor: '#182633',
    gridColor: 'rgba(120, 195, 245, 0.11)',
    accentColor: '#67b7e8',
    enemyLevelMultiplier: 9.5,
    targetKillsForBoss: 25,
    bossName: 'Ледяная Королева Девиаса',
  },
  {
    id: 'dungeon',
    name: '5. Цитадель Подземелья (Dungeon)',
    subtitle: 'Базальтовый бастион Личей и Горгон — споты Квестовой Реликвии 1-й Профы (Ур. 50 · ×16 мощь)',
    recommendedLevel: 48,
    groundColor: '#17111a',
    tileAccentColor: '#231826',
    gridColor: 'rgba(225, 110, 80, 0.1)',
    accentColor: '#e06d53',
    enemyLevelMultiplier: 16.0,
    targetKillsForBoss: 28,
    bossName: 'Повелитель Горгон',
  },
  {
    id: 'atlans',
    name: '6. Подводный Город Атланс (Atlans)',
    subtitle: 'Коралловый купол глубин, руины тритонов и логово Гидры (×26 мощь врагов)',
    recommendedLevel: 60,
    groundColor: '#0c1926',
    tileAccentColor: '#122638',
    gridColor: 'rgba(56, 189, 248, 0.12)',
    accentColor: '#38bdf8',
    enemyLevelMultiplier: 26.0,
    targetKillsForBoss: 30,
    bossName: 'Гидра Бездны Атланса',
  },
  {
    id: 'lost_tower',
    name: '7. Затерянная Башня (Lost Tower)',
    subtitle: 'Осадный гарнизон у подножия проклятой цитадели Балрога (×40 мощь врагов)',
    recommendedLevel: 74,
    groundColor: '#1c1210',
    tileAccentColor: '#291a16',
    gridColor: 'rgba(251, 146, 60, 0.12)',
    accentColor: '#fb923c',
    enemyLevelMultiplier: 40.0,
    targetKillsForBoss: 32,
    bossName: 'Демон Балрог (Balrog)',
  },
  {
    id: 'tarkan',
    name: '8. Пустынный Форпост Таркан (Tarkan)',
    subtitle: 'Раскалённый город в песках Мутантов и Кровавых Волков Заикана (×60 мощь врагов)',
    recommendedLevel: 88,
    groundColor: '#21170e',
    tileAccentColor: '#2e2013',
    gridColor: 'rgba(245, 158, 11, 0.12)',
    accentColor: '#f59e0b',
    enemyLevelMultiplier: 60.0,
    targetKillsForBoss: 34,
    bossName: 'Заикан: Повелитель Песков',
  },
  {
    id: 'icarus',
    name: '9. Небесный Город Икарус (Icarus)',
    subtitle: 'Парящий бастион в облаках, гнездовья Алквимов и Огненного Феникса (×88 мощь врагов)',
    recommendedLevel: 102,
    groundColor: '#101a28',
    tileAccentColor: '#172538',
    gridColor: 'rgba(125, 211, 252, 0.12)',
    accentColor: '#7dd3fc',
    enemyLevelMultiplier: 88.0,
    targetKillsForBoss: 36,
    bossName: 'Огненный Феникс Икаруса',
  },
  {
    id: 'kalima',
    name: '10. Затонувший Храм Калима (Kalima)',
    subtitle: 'Древнее святилище морских глубин и иллюзий Кундуна (×126 мощь врагов)',
    recommendedLevel: 115,
    groundColor: '#0e1d22',
    tileAccentColor: '#142a30',
    gridColor: 'rgba(45, 212, 191, 0.12)',
    accentColor: '#2dd4bf',
    enemyLevelMultiplier: 126.0,
    targetKillsForBoss: 38,
    bossName: 'Иллюзия Кундуна Калимы',
  },
  {
    id: 'valley_of_loren',
    name: '11. Долина Лорен (Valley of Loren)',
    subtitle: 'Королевская осадная цитадель, крепостные рвы и гвардия Ерохима (×176 мощь врагов)',
    recommendedLevel: 128,
    groundColor: '#1a1612',
    tileAccentColor: '#26201a',
    gridColor: 'rgba(234, 179, 8, 0.12)',
    accentColor: '#eab308',
    enemyLevelMultiplier: 176.0,
    targetKillsForBoss: 40,
    bossName: 'Лорд Ерохим (Erohim)',
  },
  {
    id: 'crywolf',
    name: '12. Крепость Крайвульф (Crywolf)',
    subtitle: 'Оборонительный город Алтаря Волка против тёмных легионов Балгасса (×240 мощь врагов)',
    recommendedLevel: 142,
    groundColor: '#161822',
    tileAccentColor: '#202330',
    gridColor: 'rgba(165, 180, 252, 0.12)',
    accentColor: '#a5b4fc',
    enemyLevelMultiplier: 240.0,
    targetKillsForBoss: 42,
    bossName: 'Тёмный Эльф Крайвульфа',
  },
  {
    id: 'aida',
    name: '13. Проклятый Лес Аида (Aida)',
    subtitle: '💎 ДРОП JEWEL OF CHAOS (150+ Ур.) · Сумрачный бастион Адского Майна (×330 мощь врагов)',
    recommendedLevel: 155,
    groundColor: '#131b15',
    tileAccentColor: '#1b261e',
    gridColor: 'rgba(132, 204, 22, 0.12)',
    accentColor: '#84cc16',
    enemyLevelMultiplier: 330.0,
    targetKillsForBoss: 44,
    bossName: 'Демон Hell Maine',
  },
  {
    id: 'kanturu_ruins',
    name: '14. Руины Кантуру (Kanturu Ruins)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Империя древних машин Кантуру (×450 мощь врагов)',
    recommendedLevel: 168,
    groundColor: '#1c1814',
    tileAccentColor: '#28221c',
    gridColor: 'rgba(251, 191, 36, 0.12)',
    accentColor: '#fbbf24',
    enemyLevelMultiplier: 450.0,
    targetKillsForBoss: 46,
    bossName: 'Механический Титан Кантуру',
  },
  {
    id: 'kanturu_relics',
    name: '15. Святилище Кантуру (Kanturu Relics)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Башня Очищения и врата Кошмара (×610 мощь · Реком. 1 Ресет)',
    recommendedLevel: 180,
    groundColor: '#181424',
    tileAccentColor: '#231d33',
    gridColor: 'rgba(168, 85, 247, 0.12)',
    accentColor: '#a855f7',
    enemyLevelMultiplier: 610.0,
    targetKillsForBoss: 48,
    bossName: 'Повелитель Кошмара (Nightmare)',
  },
  {
    id: 'barrack_of_balgass',
    name: '16. Казармы Балгасса (Balgass Barracks)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Военный плацдарм Балгасса (×820 мощь · Реком. 1+ Ресет)',
    recommendedLevel: 192,
    groundColor: '#201114',
    tileAccentColor: '#2d181c',
    gridColor: 'rgba(248, 113, 113, 0.12)',
    accentColor: '#f87171',
    enemyLevelMultiplier: 820.0,
    targetKillsForBoss: 50,
    bossName: 'Полководец Балгасс (Balgass)',
  },
  {
    id: 'karutan',
    name: '17. Пустоши Карутана (Karutan)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Ядовитые каньоны Кондры (×1100 мощь · Реком. 2+ Ресета)',
    recommendedLevel: 205,
    groundColor: '#1d1911',
    tileAccentColor: '#292318',
    gridColor: 'rgba(250, 204, 21, 0.12)',
    accentColor: '#facc15',
    enemyLevelMultiplier: 1100.0,
    targetKillsForBoss: 52,
    bossName: 'Император Скорпионов Кондра',
  },
  {
    id: 'raklion',
    name: '18. Ледяное Логово Раклион (Raklion)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Логово паука Селупана (×1450 мощь · Реком. 2+ Ресета)',
    recommendedLevel: 218,
    groundColor: '#0e1b26',
    tileAccentColor: '#152736',
    gridColor: 'rgba(56, 189, 248, 0.13)',
    accentColor: '#38bdf8',
    enemyLevelMultiplier: 1450.0,
    targetKillsForBoss: 54,
    bossName: 'Ледяной Паук Селупан (Selupan)',
  },
  {
    id: 'swamp_of_calmness',
    name: '19. Болото Покоя (Swamp of Calmness)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Четыре сектора Медузы (×1900 мощь · Реком. 3+ Ресета)',
    recommendedLevel: 230,
    groundColor: '#101d19',
    tileAccentColor: '#172924',
    gridColor: 'rgba(16, 185, 129, 0.13)',
    accentColor: '#10b981',
    enemyLevelMultiplier: 1900.0,
    targetKillsForBoss: 56,
    bossName: 'Королева Болот Медуза',
  },
  {
    id: 'vulcanus',
    name: '20. Огненный Город Вулканус (Vulcanus)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Жерло вулкана Игниса (×2500 мощь · Реком. 3+ Ресета)',
    recommendedLevel: 242,
    groundColor: '#23110e',
    tileAccentColor: '#311814',
    gridColor: 'rgba(249, 115, 22, 0.13)',
    accentColor: '#f97316',
    enemyLevelMultiplier: 2500.0,
    targetKillsForBoss: 58,
    bossName: 'Вулканический Лорд Игнис',
  },
  {
    id: 'acheron',
    name: '21. Древний Город Ахерон (Acheron)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Столица пентаграмм Арка (×3300 мощь · Реком. 4+ Ресета)',
    recommendedLevel: 255,
    groundColor: '#161326',
    tileAccentColor: '#201c36',
    gridColor: 'rgba(217, 70, 239, 0.13)',
    accentColor: '#d946ef',
    enemyLevelMultiplier: 3300.0,
    targetKillsForBoss: 60,
    bossName: 'Хранитель Пентаграмм Уркан',
  },
  {
    id: 'ferea',
    name: '22. Королевский Бастион Ферея (Ferea)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Замок кристальных копий (×4400 мощь · Реком. 4+ Ресета)',
    recommendedLevel: 268,
    groundColor: '#1b1622',
    tileAccentColor: '#272030',
    gridColor: 'rgba(244, 114, 182, 0.13)',
    accentColor: '#f472b6',
    enemyLevelMultiplier: 4400.0,
    targetKillsForBoss: 62,
    bossName: 'Лорд-Генерал Фереи',
  },
  {
    id: 'nixies_lake',
    name: '23. Озеро Никси (Nixies Lake)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Город вечной мерзлоты Никси (×5850 мощь · Реком. 5+ Ресетов)',
    recommendedLevel: 282,
    groundColor: '#0d1929',
    tileAccentColor: '#14243b',
    gridColor: 'rgba(96, 165, 250, 0.14)',
    accentColor: '#60a5fa',
    enemyLevelMultiplier: 5850.0,
    targetKillsForBoss: 64,
    bossName: 'Дух Льда Никси (Nix)',
  },
  {
    id: 'blood_castle',
    name: '24. Цитадель Кундуна (Kundun Sanctum)',
    subtitle: '💎 ДРОП CHAOS (150+ Ур.) · Финальный трон Владыки Кундуна (×7800 мощь · Реком. 5+ Ресетов)',
    recommendedLevel: 295,
    groundColor: '#1f0e13',
    tileAccentColor: '#2c141b',
    gridColor: 'rgba(244, 63, 94, 0.14)',
    accentColor: '#f43f5e',
    enemyLevelMultiplier: 7800.0,
    targetKillsForBoss: 68,
    bossName: 'Кундун: Владыка Континента MU',
  },
];

export const CLASSES: Record<CharacterClassId, ClassDefinition> = {
  dark_knight: {
    id: 'dark_knight',
    name: 'Dark Knight',
    tierTitles: {
      1: 'Dark Knight (Тёмный Рыцарь)',
      2: 'Blade Knight (Рыцарь Клинка)',
      3: 'Blade Master (Мастер Клинка)',
    },
    setName: 'Hyon Dragon Set',
    loreShort: 'Воин ближнего боя в доспехах Чёрного Дракона. Исполняет смертоносные комбо-удары.',
    accentColor: '#e14d43',
    secondaryColor: '#f59e0b',
    baseAttributes: { str: 28, agi: 20, vit: 25, ene: 12 },
    startingWeapon: {
      id: 'start_dk_sword',
      name: 'Клинок Хаоса',
      slot: 'weapon',
      rarity: 'magic',
      level: 1,
      lifeOption: 4,
      baseAttack: 24,
      baseDefense: 0,
      critChanceBonus: 4,
      moveSpeedBonus: 0,
      setName: 'Hyon Dragon Set',
      classRestriction: 'dark_knight',
      valueZen: 350,
    },
    startingArmor: {
      id: 'start_dk_armor',
      name: 'Кираса Чёрного Дракона',
      slot: 'armor',
      rarity: 'magic',
      level: 1,
      lifeOption: 4,
      baseAttack: 0,
      baseDefense: 22,
      critChanceBonus: 0,
      moveSpeedBonus: 0,
      setName: 'Hyon Dragon Set',
      classRestriction: 'dark_knight',
      valueZen: 400,
    },
    startingHelm: {
      id: 'start_dk_helm',
      name: 'Шлем Чёрного Дракона',
      slot: 'helm',
      rarity: 'magic',
      level: 1,
      lifeOption: 0,
      baseAttack: 0,
      baseDefense: 14,
      critChanceBonus: 2,
      moveSpeedBonus: 0,
      setName: 'Hyon Dragon Set',
      classRestriction: 'dark_knight',
      valueZen: 300,
    },
    skills: [
      {
        id: 'cyclone_slash',
        name: 'Cyclone Slash',
        bookName: 'Фолиант Cyclone Slash',
        requiredLevel: 3,
        bookPriceZen: 350,
        roleClue: 'Рассекающий удар [Комбо Шаг 1]',
        keyBinding: '1',
        manaCost: 6,
        cooldownSec: 0.65,
        damageMultiplier: 1.45,
        range: 110,
        aoeRadius: 90,
        requiredTier: 1,
        pattern: 'melee_arc',
        color: '#f87171',
      },
      {
        id: 'twisting_slash',
        name: 'Twisting Slash',
        bookName: 'Сфера Twisting Slash',
        requiredLevel: 12,
        bookPriceZen: 1400,
        roleClue: 'Вихрь клинков 360° [Комбо Шаг 2]',
        keyBinding: '2',
        manaCost: 14,
        cooldownSec: 2.0,
        damageMultiplier: 2.15,
        range: 140,
        aoeRadius: 140,
        requiredTier: 1,
        pattern: 'spin_aoe',
        color: '#fbbf24',
      },
      {
        id: 'death_stab',
        name: 'Blow of Fury',
        bookName: 'Сфера Blow of Fury',
        requiredLevel: 26,
        bookPriceZen: 3800,
        roleClue: 'Землетрясение [Финал Комбо 1→2→3]',
        keyBinding: '3',
        manaCost: 22,
        cooldownSec: 4.0,
        damageMultiplier: 3.25,
        range: 170,
        aoeRadius: 160,
        requiredTier: 1,
        pattern: 'ground_slam',
        color: '#ef4444',
      },
      {
        id: 'combo_nova',
        name: 'Sword Blast (Ульта)',
        bookName: 'Древний Том Sword Blast',
        requiredLevel: 50,
        bookPriceZen: 9000,
        roleClue: 'Взрыв тысячи клинков Мастера (1+ Проф.)',
        keyBinding: '4',
        manaCost: 34,
        cooldownSec: 6.5,
        damageMultiplier: 4.5,
        range: 220,
        aoeRadius: 210,
        requiredTier: 2,
        pattern: 'combo_nova',
        color: '#38bdf8',
      },
    ],
  },
  dark_wizard: {
    id: 'dark_wizard',
    name: 'Dark Wizard',
    tierTitles: {
      1: 'Dark Wizard (Тёмный Маг)',
      2: 'Soul Master (Повелитель Душ)',
      3: 'Grand Master (Гранд Мастер)',
    },
    setName: 'Anubis Legendary Set',
    loreShort: 'Повелитель стихий и духов тьмы, сжигающий легионы врагов заклинаниями по площади.',
    accentColor: '#60a5fa',
    secondaryColor: '#c084fc',
    baseAttributes: { str: 14, agi: 18, vit: 18, ene: 35 },
    startingWeapon: {
      id: 'start_dw_staff',
      name: 'Посох Легендарной Души',
      slot: 'weapon',
      rarity: 'magic',
      level: 1,
      lifeOption: 4,
      baseAttack: 28,
      baseDefense: 0,
      critChanceBonus: 6,
      moveSpeedBonus: 0,
      setName: 'Anubis Legendary Set',
      classRestriction: 'dark_wizard',
      valueZen: 380,
    },
    startingArmor: {
      id: 'start_dw_armor',
      name: 'Мантия Анубиса',
      slot: 'armor',
      rarity: 'magic',
      level: 1,
      lifeOption: 4,
      baseAttack: 0,
      baseDefense: 16,
      critChanceBonus: 2,
      moveSpeedBonus: 5,
      setName: 'Anubis Legendary Set',
      classRestriction: 'dark_wizard',
      valueZen: 360,
    },
    startingHelm: {
      id: 'start_dw_helm',
      name: 'Венец Анубиса',
      slot: 'helm',
      rarity: 'magic',
      level: 1,
      lifeOption: 0,
      baseAttack: 4,
      baseDefense: 11,
      critChanceBonus: 3,
      moveSpeedBonus: 0,
      setName: 'Anubis Legendary Set',
      classRestriction: 'dark_wizard',
      valueZen: 310,
    },
    skills: [
      {
        id: 'aqua_beam',
        name: 'Aqua Beam',
        bookName: 'Свиток Aqua Beam',
        requiredLevel: 3,
        bookPriceZen: 350,
        roleClue: 'Пронзающий луч света [Комбо Шаг 1]',
        keyBinding: '1',
        manaCost: 8,
        cooldownSec: 0.7,
        damageMultiplier: 1.55,
        range: 245,
        aoeRadius: 80,
        requiredTier: 1,
        pattern: 'dark_beam',
        color: '#38bdf8',
      },
      {
        id: 'evil_spirits',
        name: 'Evil Spirits',
        bookName: 'Свиток Evil Spirits',
        requiredLevel: 12,
        bookPriceZen: 1400,
        roleClue: 'Вихрь теневых духов [Комбо Шаг 2]',
        keyBinding: '2',
        manaCost: 18,
        cooldownSec: 2.3,
        damageMultiplier: 2.4,
        range: 235,
        aoeRadius: 215,
        requiredTier: 1,
        pattern: 'evil_spirits',
        color: '#a855f7',
      },
      {
        id: 'hellfire_meteor',
        name: 'Hellfire',
        bookName: 'Свиток Hellfire',
        requiredLevel: 26,
        bookPriceZen: 3800,
        roleClue: 'Метеоритный шторм [Финал Комбо 1→2→3]',
        keyBinding: '3',
        manaCost: 26,
        cooldownSec: 4.3,
        damageMultiplier: 3.5,
        range: 220,
        aoeRadius: 185,
        requiredTier: 1,
        pattern: 'meteor_strike',
        color: '#f97316',
      },
      {
        id: 'soul_supernova',
        name: 'Nova (Сверхновая)',
        bookName: 'Древний Свиток Nova',
        requiredLevel: 50,
        bookPriceZen: 9000,
        roleClue: 'Коллапс звезды Гранд Мастера (1+ Проф.)',
        keyBinding: '4',
        manaCost: 38,
        cooldownSec: 6.8,
        damageMultiplier: 4.75,
        range: 250,
        aoeRadius: 235,
        requiredTier: 2,
        pattern: 'soul_supernova',
        color: '#e879f9',
      },
    ],
  },
  fairy_elf: {
    id: 'fairy_elf',
    name: 'Fairy Elf',
    tierTitles: {
      1: 'Fairy Elf (Эльф Нории)',
      2: 'Muse Elf (Муза-Эльф)',
      3: 'High Elf (Высший Эльф)',
    },
    setName: 'Gywen Guardian Set',
    loreShort: 'Лучница Нории с веерным залпом стрел, морозным замедлением и аурой исцеления.',
    accentColor: '#34d399',
    secondaryColor: '#fde047',
    baseAttributes: { str: 16, agi: 32, vit: 19, ene: 18 },
    startingWeapon: {
      id: 'start_fe_bow',
      name: 'Лук Серебряного Крыла',
      slot: 'weapon',
      rarity: 'magic',
      level: 1,
      lifeOption: 4,
      baseAttack: 25,
      baseDefense: 0,
      critChanceBonus: 9,
      moveSpeedBonus: 8,
      setName: 'Gywen Guardian Set',
      classRestriction: 'fairy_elf',
      valueZen: 370,
    },
    startingArmor: {
      id: 'start_fe_armor',
      name: 'Доспех Стража Нории',
      slot: 'armor',
      rarity: 'magic',
      level: 1,
      lifeOption: 4,
      baseAttack: 0,
      baseDefense: 18,
      critChanceBonus: 4,
      moveSpeedBonus: 10,
      setName: 'Gywen Guardian Set',
      classRestriction: 'fairy_elf',
      valueZen: 390,
    },
    startingHelm: {
      id: 'start_fe_helm',
      name: 'Диадема Стража Нории',
      slot: 'helm',
      rarity: 'magic',
      level: 1,
      lifeOption: 0,
      baseAttack: 2,
      baseDefense: 13,
      critChanceBonus: 4,
      moveSpeedBonus: 4,
      setName: 'Gywen Guardian Set',
      classRestriction: 'fairy_elf',
      valueZen: 310,
    },
    skills: [
      {
        id: 'triple_shot',
        name: 'Triple Shot',
        bookName: 'Книга Triple Shot',
        requiredLevel: 3,
        bookPriceZen: 350,
        roleClue: 'Веер из 5 стрел [Комбо Шаг 1]',
        keyBinding: '1',
        manaCost: 7,
        cooldownSec: 0.6,
        damageMultiplier: 1.5,
        range: 265,
        aoeRadius: 100,
        requiredTier: 1,
        pattern: 'triple_arrow',
        color: '#4ade80',
      },
      {
        id: 'ice_arrow',
        name: 'Ice Arrow',
        bookName: 'Книга Ice Arrow',
        requiredLevel: 12,
        bookPriceZen: 1400,
        roleClue: 'Морозный залп и заморозка [Комбо Шаг 2]',
        keyBinding: '2',
        manaCost: 15,
        cooldownSec: 2.1,
        damageMultiplier: 2.25,
        range: 250,
        aoeRadius: 145,
        requiredTier: 1,
        pattern: 'ice_arrow',
        color: '#38bdf8',
      },
      {
        id: 'starfall_blessing',
        name: 'Starfall + Heal',
        bookName: 'Книга Starfall + Heal',
        requiredLevel: 26,
        bookPriceZen: 3800,
        roleClue: 'Звёздный ливень и +25% ОЗ [Финал Комбо]',
        keyBinding: '3',
        manaCost: 24,
        cooldownSec: 4.2,
        damageMultiplier: 2.95,
        range: 225,
        aoeRadius: 175,
        requiredTier: 1,
        pattern: 'guardian_buff',
        color: '#facc15',
      },
      {
        id: 'infinity_arrow_storm',
        name: 'Infinity Storm (Ульта)',
        bookName: 'Древняя Книга Infinity Storm',
        requiredLevel: 50,
        bookPriceZen: 9000,
        roleClue: 'Небесный шквал стрел Высшего Эльфа (1+ Проф.)',
        keyBinding: '4',
        manaCost: 34,
        cooldownSec: 6.2,
        damageMultiplier: 4.4,
        range: 260,
        aoeRadius: 220,
        requiredTier: 2,
        pattern: 'infinity_arrow_storm',
        color: '#34d399',
      },
    ],
  },
};

export function getClassDisplayTitle(classId: CharacterClassId, tier: ClassTier = 1): string {
  return CLASSES[classId].tierTitles[tier];
}

export function getFirstProfQuestItemName(classId: CharacterClassId): string {
  if (classId === 'dark_knight') return 'Осколок Меча Императора (Broken Sword)';
  if (classId === 'dark_wizard') return 'Душа Древнего Пророка (Soul of Wizard)';
  return 'Слеза Эльфийской Богини (Tear of Elf)';
}

export function calculateItemEffectiveAttack(item: EquipmentItem | null): number {
  if (!item) return 0;
  const rarityMult =
    item.rarity === 'ancient' ? 1.58 : item.rarity === 'excellent' ? 1.36 : item.rarity === 'magic' ? 1.14 : 1.0;
  const upgradeBonus = item.level * 5 + (item.level >= 7 ? (item.level - 6) * 4 : 0);
  const lifeBonus = item.lifeOption ?? 0;
  return Math.round(item.baseAttack * rarityMult + (item.baseAttack > 0 ? upgradeBonus + lifeBonus : 0));
}

export function calculateItemEffectiveDefense(item: EquipmentItem | null): number {
  if (!item) return 0;
  const rarityMult =
    item.rarity === 'ancient' ? 1.58 : item.rarity === 'excellent' ? 1.36 : item.rarity === 'magic' ? 1.14 : 1.0;
  const upgradeBonus = item.level * 4 + (item.level >= 7 ? (item.level - 6) * 3 : 0);
  const lifeBonus = Math.round((item.lifeOption ?? 0) * 0.75);
  return Math.round(item.baseDefense * rarityMult + (item.baseDefense > 0 ? upgradeBonus + lifeBonus : 0));
}

export function calculateDerivedStats(state: PlayerProgressState): DerivedStats {
  const { attributes, level, equipped, classId, classTier, resets } = state;
  const cls = CLASSES[classId];

  const slots: ItemSlot[] = ['weapon', 'armor', 'helm', 'wings', 'ring', 'pendant'];
  let totalEquipAtk = 0;
  let totalEquipDef = 0;
  let equipCrit = 0;
  let equipSpeed = 0;
  let activeSetPieceCount = 0;

  for (const s of slots) {
    const it = equipped[s];
    if (!it) continue;
    totalEquipAtk += calculateItemEffectiveAttack(it);
    totalEquipDef += calculateItemEffectiveDefense(it);
    equipCrit += it.critChanceBonus;
    equipSpeed += it.moveSpeedBonus;
    if (it.setName === cls.setName) {
      activeSetPieceCount += 1;
    }
  }

  // Ancient Set Bonus when 3+ set pieces are equipped
  const hasFullSetBonus = activeSetPieceCount >= 3;
  const setAtkMultiplier = hasFullSetBonus ? 1.18 : activeSetPieceCount >= 2 ? 1.08 : 1.0;
  const tierBonusMult = classTier === 3 ? 1.25 : classTier === 2 ? 1.12 : 1.0;
  // Grand Reset Power Multiplier: each Reset permanently locks in Level 300 mastery (+1450 ATK, +880 DEF, +7500 HP)
  // AND multiplies total Attack & Defense by +45% per Grand Reset!
  const resetPowerMult = 1 + resets * 0.45;

  const primaryAttr =
    classId === 'dark_knight'
      ? attributes.str * 1.48 + attributes.ene * 0.42
      : classId === 'dark_wizard'
        ? attributes.ene * 1.58 + attributes.str * 0.3
        : attributes.agi * 1.48 + attributes.str * 0.45;

  const baseDmg = Math.round(
    (primaryAttr + level * 4.5 + totalEquipAtk + resets * 1450) *
      setAtkMultiplier *
      tierBonusMult *
      resetPowerMult
  );
  const minDamage = Math.max(10, Math.round(baseDmg * 0.85));
  const maxDamage = Math.max(minDamage + 5, Math.round(baseDmg * 1.2));

  const defense = Math.round(
    (attributes.agi * 0.8 + level * 2.8 + totalEquipDef + resets * 880) *
      (hasFullSetBonus ? 1.15 : 1.0) *
      resetPowerMult
  );
  const maxHp = Math.round(
    (150 +
      attributes.vit * 7.5 +
      level * 25 +
      (equipped.wings ? 95 : 0) +
      (hasFullSetBonus ? 120 : 0) +
      resets * 7500) *
      (1 + resets * 0.35)
  );
  const maxMp = Math.round(75 + attributes.ene * 4.8 + level * 13 + (hasFullSetBonus ? 60 : 0));

  const critChance = Math.min(
    80,
    Math.round(8 + attributes.agi * 0.35 + equipCrit + (hasFullSetBonus ? 12 : 0))
  );
  const doubleDamageChance = hasFullSetBonus ? 20 : activeSetPieceCount >= 2 ? 10 : 4;

  const moveSpeed = Math.min(350, Math.round(192 + attributes.agi * 0.72 + equipSpeed));
  const combatPower = Math.round(
    (minDamage + maxDamage) * 1.45 +
      defense * 1.85 +
      maxHp * 0.35 +
      critChance * 4.5 +
      doubleDamageChance * 6
  );

  return {
    maxHp,
    maxMp,
    minDamage,
    maxDamage,
    defense,
    critChance,
    doubleDamageChance,
    moveSpeed,
    combatPower,
    activeSetPieceCount,
    activeSetName: cls.setName,
  };
}

export function calculateExpToNextLevel(level: number): number {
  return Math.round(90 + level * 45 + Math.pow(level, 1.52) * 11);
}

export function createInitialPlayerState(classId: CharacterClassId = 'dark_knight'): PlayerProgressState {
  const cls = CLASSES[classId];
  return {
    classId,
    classTier: 1,
    resets: 0,
    level: 1,
    exp: 0,
    expToNext: calculateExpToNextLevel(1),
    statPoints: 15,
    attributes: { ...cls.baseAttributes },
    zen: 600,
    jewels: {
      bless: 2,
      soul: 1,
      life: 1,
      chaos: 0,
    },
    potions: 3,
    hpPotions: 3,
    mpPotions: 3,
    hasFirstProfQuestItem: false,
    bloodScrolls: 0,
    bloodFangs: 0,
    bloodCastleTickets: 0,
    inBloodCastle: false,
    bloodCastleClears: 0,
    learnedSkills: [],
    equipped: {
      weapon: null,
      armor: null,
      helm: null,
      wings: null,
      ring: null,
      pendant: null,
    },
    inventory: [],
    territoryId: 'lorencia',
    killsInTerritory: 0,
    totalKills: 0,
    bossesDefeated: 0,
    highestReachedTerritoryIdx: 1,
  };
}

export interface ShopEquipmentCatalogEntry {
  catalogId: string;
  requiredLevel: number;
  priceZen: number;
  itemTemplate: EquipmentItem;
}

export function getShopEquipmentCatalog(classId: CharacterClassId): ShopEquipmentCatalogEntry[] {
  const cls = CLASSES[classId];
  return [
    {
      catalogId: 'starter_weapon',
      requiredLevel: 1,
      priceZen: 250,
      itemTemplate: {
        ...cls.startingWeapon,
        id: `shop_wep_1_${classId}`,
        rarity: 'normal',
        level: 0,
        lifeOption: 0,
        baseAttack: Math.max(14, cls.startingWeapon.baseAttack - 8),
        valueZen: 250,
      },
    },
    {
      catalogId: 'starter_armor',
      requiredLevel: 1,
      priceZen: 220,
      itemTemplate: {
        ...cls.startingArmor,
        id: `shop_arm_1_${classId}`,
        rarity: 'normal',
        level: 0,
        lifeOption: 0,
        baseDefense: Math.max(10, cls.startingArmor.baseDefense - 5),
        valueZen: 220,
      },
    },
    {
      catalogId: 'starter_helm',
      requiredLevel: 1,
      priceZen: 180,
      itemTemplate: {
        ...cls.startingHelm,
        id: `shop_hlm_1_${classId}`,
        rarity: 'normal',
        level: 0,
        lifeOption: 0,
        baseDefense: Math.max(7, cls.startingHelm.baseDefense - 3),
        valueZen: 180,
      },
    },
    {
      catalogId: 'starter_ring',
      requiredLevel: 4,
      priceZen: 520,
      itemTemplate: {
        id: `shop_rng_1_${classId}`,
        name: 'Кольцо Боевой Ярости',
        slot: 'ring',
        rarity: 'magic',
        level: 1,
        lifeOption: 4,
        baseAttack: 9,
        baseDefense: 6,
        critChanceBonus: 4,
        moveSpeedBonus: 4,
        classRestriction: classId,
        valueZen: 520,
      },
    },
    {
      catalogId: 'magic_weapon',
      requiredLevel: 8,
      priceZen: 950,
      itemTemplate: {
        ...cls.startingWeapon,
        id: `shop_wep_2_${classId}`,
        rarity: 'magic',
        level: 2,
        lifeOption: 4,
        baseAttack: cls.startingWeapon.baseAttack + 8,
        valueZen: 950,
      },
    },
    {
      catalogId: 'magic_armor',
      requiredLevel: 8,
      priceZen: 880,
      itemTemplate: {
        ...cls.startingArmor,
        id: `shop_arm_2_${classId}`,
        rarity: 'magic',
        level: 2,
        lifeOption: 4,
        baseDefense: cls.startingArmor.baseDefense + 7,
        valueZen: 880,
      },
    },
  ];
}

export function buyShopEquipmentToInventory(
  state: PlayerProgressState,
  catalogId: string,
  isNearShop = true
): { nextState: PlayerProgressState; success: boolean; message: string; boughtItem?: EquipmentItem } {
  if (!isNearShop) {
    return {
      nextState: state,
      success: false,
      message: '🔒 Вы слишком далеко от Лавки! Подойдите к Торговцу Ханзо в городе.',
    };
  }

  const catalog = getShopEquipmentCatalog(state.classId);
  const entry = catalog.find((c) => c.catalogId === catalogId);
  if (!entry) {
    return {
      nextState: state,
      success: false,
      message: 'Этот предмет не найден в лавке.',
    };
  }

  if (state.level < entry.requiredLevel) {
    return {
      nextState: state,
      success: false,
      message: `Для покупки «${entry.itemTemplate.name}» требуется Уровень ${entry.requiredLevel} (сейчас Ур. ${state.level}/${entry.requiredLevel}).`,
    };
  }

  if (state.zen < entry.priceZen) {
    return {
      nextState: state,
      success: false,
      message: `Недостаточно золота! «${entry.itemTemplate.name}» стоит ${entry.priceZen} Zen (у вас ${state.zen} Zen).`,
    };
  }

  if (state.inventory.length >= 24) {
    return {
      nextState: state,
      success: false,
      message: 'Сетка инвентаря полна! Освободите ячейку.',
    };
  }

  const boughtItem: EquipmentItem = {
    ...entry.itemTemplate,
    id: `shop_${entry.catalogId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };

  return {
    nextState: {
      ...state,
      zen: state.zen - entry.priceZen,
      inventory: [boughtItem, ...state.inventory],
    },
    success: true,
    message: `Куплено в инвентарь: ${boughtItem.name}${boughtItem.level > 0 ? ` +${boughtItem.level}` : ''} за ${entry.priceZen} Zen! Наведите мышь для просмотра статов или перетащите на куклу героя.`,
    boughtItem,
  };
}

export function buySkillBookWithZen(
  state: PlayerProgressState,
  skillId: string,
  isNearShop = true
): { nextState: PlayerProgressState; success: boolean; message: string } {
  if (!isNearShop) {
    return {
      nextState: state,
      success: false,
      message: '🔒 Вы слишком далеко от Лавки! Подойдите к Торговцу Ханзо в городе, чтобы купить книгу навыка.',
    };
  }

  const cls = CLASSES[state.classId];
  const skill = cls.skills.find((s) => s.id === skillId);
  if (!skill) {
    return {
      nextState: state,
      success: false,
      message: 'Такой книги навыка нет у вашего класса.',
    };
  }

  if (state.learnedSkills.includes(skill.id)) {
    return {
      nextState: state,
      success: false,
      message: `Навык «${skill.name}» уже изучен!`,
    };
  }

  if ((skill.requiredTier ?? 1) > state.classTier) {
    return {
      nextState: state,
      success: false,
      message: `Для изучения «${skill.bookName}» требуется 1-я Профессия (квест Жрицы Себины на 50 Ур.)!`,
    };
  }

  if (state.level < skill.requiredLevel) {
    return {
      nextState: state,
      success: false,
      message: `Для чтения «${skill.bookName}» требуется Уровень ${skill.requiredLevel} (сейчас Ур. ${state.level}/${skill.requiredLevel}).`,
    };
  }

  if (state.zen < skill.bookPriceZen) {
    return {
      nextState: state,
      success: false,
      message: `Недостаточно золота для покупки «${skill.bookName}»! Нужно ${skill.bookPriceZen} Zen (у вас ${state.zen} Zen).`,
    };
  }

  return {
    nextState: {
      ...state,
      zen: state.zen - skill.bookPriceZen,
      learnedSkills: [...state.learnedSkills, skill.id],
    },
    success: true,
    message: `Вы купили и перетащили в инвентарь «${skill.bookName}» за ${skill.bookPriceZen} Zen! Навык [${skill.keyBinding}] ${skill.name} изучен!`,
  };
}

export function buyStarterEquipmentWithZen(
  state: PlayerProgressState,
  slot: 'weapon' | 'armor' | 'helm'
): { nextState: PlayerProgressState; success: boolean; message: string } {
  const cls = CLASSES[state.classId];
  const template =
    slot === 'weapon'
      ? cls.startingWeapon
      : slot === 'armor'
        ? cls.startingArmor
        : cls.startingHelm;
  const cost = template.valueZen;

  if (state.zen < cost) {
    return {
      nextState: state,
      success: false,
      message: `Недостаточно Zen! «${template.name}» стоит ${cost} Zen (у вас ${state.zen} Zen).`,
    };
  }

  const boughtItem: EquipmentItem = {
    ...template,
    id: `shop_${slot}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    rarity: 'normal',
    level: 0,
    lifeOption: 0,
  };

  if (state.equipped[slot] === null) {
    return {
      nextState: {
        ...state,
        zen: state.zen - cost,
        equipped: {
          ...state.equipped,
          [slot]: boughtItem,
        },
      },
      success: true,
      message: `Куплено и надето: ${boughtItem.name} за ${cost} Zen!`,
    };
  }

  if (state.inventory.length >= 24) {
    return {
      nextState: state,
      success: false,
      message: 'Сетка инвентаря полна! Освободите место.',
    };
  }

  return {
    nextState: {
      ...state,
      zen: state.zen - cost,
      inventory: [boughtItem, ...state.inventory],
    },
    success: true,
    message: `Куплено в рюкзак: ${boughtItem.name} за ${cost} Zen!`,
  };
}

export function buyPotionsWithZen(
  state: PlayerProgressState,
  potionType: 'hp' | 'mp',
  packSize: 5 | 20 = 5,
  isNearShop = true
): { nextState: PlayerProgressState; success: boolean; message: string } {
  if (!isNearShop) {
    return {
      nextState: state,
      success: false,
      message: '🔒 Вы слишком далеко от Лавки! Подойдите к Торговцу Ханзо в городе, чтобы купить банки.',
    };
  }

  const unitPrice = potionType === 'hp' ? 50 : 40;
  const cost = packSize === 20 ? Math.round(unitPrice * 20 * 0.9) : unitPrice * packSize;

  if (state.zen < cost) {
    return {
      nextState: state,
      success: false,
      message: `Недостаточно золота! Для покупки ${packSize} шт. требуется ${cost} Zen (у вас ${state.zen} Zen).`,
    };
  }

  if (potionType === 'hp') {
    const nextHpPotions = state.hpPotions + packSize;
    return {
      nextState: {
        ...state,
        zen: state.zen - cost,
        hpPotions: nextHpPotions,
        potions: nextHpPotions,
      },
      success: true,
      message: `Куплено +${packSize} Банок ОЗ за ${cost} Zen (всего: ${nextHpPotions} шт.).`,
    };
  }

  const nextMpPotions = state.mpPotions + packSize;
  return {
    nextState: {
      ...state,
      zen: state.zen - cost,
      mpPotions: nextMpPotions,
    },
    success: true,
    message: `Куплено +${packSize} Банок МН за ${cost} Zen (всего: ${nextMpPotions} шт.).`,
  };
}

export function equipItemFromInventory(
  state: PlayerProgressState,
  item: EquipmentItem
): { nextState: PlayerProgressState; success: boolean; message: string } {
  const slot = item.slot;
  const currentEquipped = state.equipped[slot];
  const remainingInventory = state.inventory.filter((i) => i.id !== item.id);
  if (currentEquipped) {
    remainingInventory.unshift(currentEquipped);
  }
  return {
    nextState: {
      ...state,
      equipped: {
        ...state.equipped,
        [slot]: item,
      },
      inventory: remainingInventory,
    },
    success: true,
    message: `Надето: ${item.name} +${item.level}.`,
  };
}

export function unequipItemToInventory(
  state: PlayerProgressState,
  slot: ItemSlot
): { nextState: PlayerProgressState; success: boolean; message: string } {
  const currentEquipped = state.equipped[slot];
  if (!currentEquipped) {
    return {
      nextState: state,
      success: false,
      message: 'В этом слоте нет надетого предмета.',
    };
  }
  if (state.inventory.length >= 24) {
    return {
      nextState: state,
      success: false,
      message: 'Сетка инвентаря заполнена! Продайте лишние трофеи.',
    };
  }
  return {
    nextState: {
      ...state,
      equipped: {
        ...state.equipped,
        [slot]: null,
      },
      inventory: [currentEquipped, ...state.inventory],
    },
    success: true,
    message: `Снято в инвентарь: ${currentEquipped.name} +${currentEquipped.level}.`,
  };
}

export function allocateStatPoint(
  state: PlayerProgressState,
  stat: keyof CharacterAttributes,
  amount = 1
): PlayerProgressState {
  if (state.statPoints < amount || amount <= 0) return state;
  return {
    ...state,
    statPoints: state.statPoints - amount,
    attributes: {
      ...state.attributes,
      [stat]: state.attributes[stat] + amount,
    },
  };
}

export function grantExperience(
  state: PlayerProgressState,
  expGain: number
): { nextState: PlayerProgressState; leveledUp: boolean } {
  let exp = state.exp + Math.max(0, Math.round(expGain));
  let level = state.level;
  let expToNext = state.expToNext;
  let statPoints = state.statPoints;
  let leveledUp = false;

  const pointsPerLevel = state.classTier === 3 ? 7 : state.classTier === 2 ? 6 : 5;

  while (exp >= expToNext) {
    exp -= expToNext;
    level += 1;
    statPoints += pointsPerLevel;
    expToNext = calculateExpToNextLevel(level);
    leveledUp = true;
  }

  return {
    nextState: {
      ...state,
      level,
      exp,
      expToNext,
      statPoints,
    },
    leveledUp,
  };
}

export function evolveCharacterClass(
  state: PlayerProgressState
): { nextState: PlayerProgressState; success: boolean; message: string } {
  if (state.classTier >= 3) {
    return {
      nextState: state,
      success: false,
      message: 'Вы уже достигли высшей профессии Мастера!',
    };
  }

  const isFirstProfUpgrade = state.classTier === 1;
  const reqLevel = isFirstProfUpgrade ? 50 : 160;
  const zenCost = isFirstProfUpgrade ? 3000 : 12000;
  const bonusPoints = isFirstProfUpgrade ? 40 : 70;
  const questItemName = getFirstProfQuestItemName(state.classId);

  if (state.level < reqLevel) {
    return {
      nextState: state,
      success: false,
      message: `Для этой профессии требуется Уровень ${reqLevel} (сейчас Ур. ${state.level}/${reqLevel}).`,
    };
  }

  if (isFirstProfUpgrade && !state.hasFirstProfQuestItem) {
    return {
      nextState: state,
      success: false,
      message: `Требуется квестовая реликвия «${questItemName}»! Выбейте её с элитных квестовых монстров (★ Личи, Минотавры/Големы или Боссы на спотах).`,
    };
  }

  if (state.zen < zenCost) {
    return {
      nextState: state,
      success: false,
      message: `Для ритуала Жрицы Себины требуется ${zenCost} Zen.`,
    };
  }

  const nextTier = (state.classTier + 1) as ClassTier;
  const newTitle = getClassDisplayTitle(state.classId, nextTier);

  return {
    nextState: {
      ...state,
      classTier: nextTier,
      zen: state.zen - zenCost,
      statPoints: state.statPoints + bonusPoints,
      hasFirstProfQuestItem: isFirstProfUpgrade ? false : state.hasFirstProfQuestItem,
    },
    success: true,
    message: `Поздравляем! Вы сдали реликвию Себине и получили профессию ${newTitle}! Открыт 4-й ультимативный навык и +${bonusPoints} очков характеристик!`,
  };
}

export function performGrandReset(
  state: PlayerProgressState
): { nextState: PlayerProgressState; success: boolean; message: string } {
  if (state.level < 300) {
    return {
      nextState: state,
      success: false,
      message: `Гранд Ресет доступен с 300-го уровня (сейчас Ур. ${state.level}/300).`,
    };
  }
  return {
    nextState: {
      ...state,
      resets: state.resets + 1,
      level: 1,
      exp: 0,
      expToNext: calculateExpToNextLevel(1),
      statPoints: state.statPoints + 150,
    },
    success: true,
    message: `Гранд Ресет #${state.resets + 1} выполнен на 300 уровне! Все характеристики сохранены + начислено 150 бонусных очков!`,
  };
}

export function upgradeItemWithJewel(
  state: PlayerProgressState,
  itemId: string,
  jewelType: 'bless' | 'soul' | 'life',
  deterministicRoll = 0.25
): { nextState: PlayerProgressState; success: boolean; message: string } {
  if (state.jewels[jewelType] <= 0) {
    const names = { bless: 'Jewel of Bless', soul: 'Jewel of Soul', life: 'Jewel of Life' };
    return {
      nextState: state,
      success: false,
      message: `Недостаточно камней (${names[jewelType]}).`,
    };
  }

  let targetItem: EquipmentItem | null = null;
  let equippedSlot: ItemSlot | null = null;

  (['weapon', 'armor', 'helm', 'wings', 'ring', 'pendant'] as ItemSlot[]).forEach((slot) => {
    if (state.equipped[slot]?.id === itemId) {
      targetItem = state.equipped[slot];
      equippedSlot = slot;
    }
  });

  if (!targetItem) {
    targetItem = state.inventory.find((i) => i.id === itemId) ?? null;
  }

  if (!targetItem) {
    return { nextState: state, success: false, message: 'Предмет не найден.' };
  }

  if (jewelType === 'life') {
    if ((targetItem.lifeOption ?? 0) >= 28) {
      return {
        nextState: state,
        success: false,
        message: 'Опция Jewel of Life уже достигла максимума +28!',
      };
    }
    const nextLife = Math.min(28, (targetItem.lifeOption ?? 0) + 4);
    const updatedItem: EquipmentItem = {
      ...targetItem,
      lifeOption: nextLife,
      valueZen: Math.round(targetItem.valueZen * 1.2),
    };
    const nextJewels = { ...state.jewels, life: state.jewels.life - 1 };

    if (equippedSlot) {
      return {
        nextState: {
          ...state,
          jewels: nextJewels,
          equipped: { ...state.equipped, [equippedSlot]: updatedItem },
        },
        success: true,
        message: `Jewel of Life усилил ${updatedItem.name}: доп. опция +${nextLife}!`,
      };
    }
    return {
      nextState: {
        ...state,
        jewels: nextJewels,
        inventory: state.inventory.map((i) => (i.id === itemId ? updatedItem : i)),
      },
      success: true,
      message: `Jewel of Life усилил ${updatedItem.name}: доп. опция +${nextLife}!`,
    };
  }

  if (targetItem.level >= 15) {
    return { nextState: state, success: false, message: 'Предмет уже достиг максимума +15!' };
  }

  const successRate = jewelType === 'bless' ? (targetItem.level < 6 ? 1.0 : 0.72) : 0.8;
  const isSuccess = deterministicRoll <= successRate;

  const newLevel = isSuccess
    ? targetItem.level + 1
    : jewelType === 'soul' && targetItem.level >= 7
      ? Math.max(0, targetItem.level - 1)
      : targetItem.level;

  const updatedItem: EquipmentItem = {
    ...targetItem,
    level: newLevel,
    valueZen: Math.round(targetItem.valueZen * (isSuccess ? 1.25 : 1.0)),
  };

  const nextJewels = {
    ...state.jewels,
    [jewelType]: state.jewels[jewelType] - 1,
  };

  if (equippedSlot) {
    return {
      nextState: {
        ...state,
        jewels: nextJewels,
        equipped: {
          ...state.equipped,
          [equippedSlot]: updatedItem,
        },
      },
      success: isSuccess,
      message: isSuccess
        ? `Успех! ${updatedItem.name} улучшен до +${updatedItem.level}!`
        : `Камень погас... Уровень предмета: +${updatedItem.level}.`,
    };
  }

  return {
    nextState: {
      ...state,
      jewels: nextJewels,
      inventory: state.inventory.map((i) => (i.id === itemId ? updatedItem : i)),
    },
    success: isSuccess,
    message: isSuccess
      ? `Успех! ${updatedItem.name} улучшен до +${updatedItem.level}!`
      : `Камень погас... Уровень предмета: +${updatedItem.level}.`,
  };
}

export function craftChaosWings(
  state: PlayerProgressState
): { nextState: PlayerProgressState; success: boolean; message: string; craftedWings?: EquipmentItem } {
  const zenCost = 800;
  if (state.jewels.chaos < 1) {
    return { nextState: state, success: false, message: 'Требуется 1 Jewel of Chaos для Машины Хаоса.' };
  }
  if (state.zen < zenCost) {
    return { nextState: state, success: false, message: `Требуется ${zenCost} Zen для запуска синтеза.` };
  }

  const hasTier2Wings = state.equipped.wings !== null;

  const wingNamesTier2: Record<CharacterClassId, string> = {
    dark_knight: 'Крылья Сатаны (Wings of Satan II)',
    dark_wizard: 'Крылья Небес (Wings of Heaven II)',
    fairy_elf: 'Крылья Эльфа (Wings of Elf II)',
  };

  const wingNamesTier3: Record<CharacterClassId, string> = {
    dark_knight: 'Крылья Шторма (Wings of Storm III)',
    dark_wizard: 'Крылья Вечности (Wings of Eternal III)',
    fairy_elf: 'Крылья Иллюзии (Wings of Illusion III)',
  };

  const currentWingLevel = state.equipped.wings?.level ?? 0;
  const newWings: EquipmentItem = {
    id: `wings_${state.classId}_${Date.now()}`,
    name: hasTier2Wings ? wingNamesTier3[state.classId] : wingNamesTier2[state.classId],
    slot: 'wings',
    rarity: hasTier2Wings ? 'ancient' : 'excellent',
    level: Math.min(15, currentWingLevel + 2),
    lifeOption: hasTier2Wings ? 12 : 8,
    baseAttack: hasTier2Wings ? 42 : 26,
    baseDefense: hasTier2Wings ? 36 : 22,
    critChanceBonus: hasTier2Wings ? 14 : 8,
    moveSpeedBonus: hasTier2Wings ? 32 : 24,
    setName: CLASSES[state.classId].setName,
    classRestriction: state.classId,
    excellentOption: hasTier2Wings
      ? 'Ancient Крылья 3-го Уровня: Игнорирование 10% брони + Аура Полёта'
      : 'Excellent Крылья 2-го Уровня: Поглощение 20% урона + Скорость полёта',
    valueZen: hasTier2Wings ? 4800 : 2500,
  };

  return {
    nextState: {
      ...state,
      zen: state.zen - zenCost,
      jewels: {
        ...state.jewels,
        chaos: state.jewels.chaos - 1,
      },
      equipped: {
        ...state.equipped,
        wings: newWings,
      },
    },
    success: true,
    message: `Синтез Хаоса завершён! Выкованы ${newWings.name} +${newWings.level} (надеты автоматически)!`,
    craftedWings: newWings,
  };
}

export function generateEquipmentDrop(
  classId: CharacterClassId,
  territoryIdx: number,
  isBoss: boolean,
  seedRoll = Math.random()
): EquipmentItem {
  // Proportional rarity progression by territory:
  // Cities 1-3 (idx 0..2): Strictly weak Common ('normal') items
  // Cities 4-7 (idx 3..6): Common ('normal') & Magic ('magic')
  // Cities 8-14 (idx 7..13): Normal, Magic & first Excellent items
  // Cities 15-19 (idx 14..18): Magic, Excellent & rare Ancient items
  // Cities 20-24 (idx 19..23): High Excellent & Ancient Set items
  let rarity: ItemRarity = 'normal';
  let itemLevel = 0;
  let lifeOption = 0;

  if (territoryIdx <= 2) {
    rarity = 'normal';
    itemLevel = isBoss ? 1 : seedRoll > 0.65 ? 1 : 0;
    lifeOption = 0;
  } else if (territoryIdx <= 6) {
    rarity = isBoss ? 'magic' : seedRoll > 0.62 ? 'magic' : 'normal';
    itemLevel = isBoss ? 3 : Math.floor(seedRoll * 2) + 1;
    lifeOption = isBoss || seedRoll > 0.65 ? 4 : 0;
  } else if (territoryIdx <= 13) {
    rarity = isBoss
      ? seedRoll > 0.42
        ? 'excellent'
        : 'magic'
      : seedRoll > 0.82
        ? 'excellent'
        : seedRoll > 0.32
          ? 'magic'
          : 'normal';
    itemLevel = isBoss ? 5 : Math.floor(seedRoll * 3) + 2;
    lifeOption = isBoss ? 8 : seedRoll > 0.45 ? 4 : 0;
  } else if (territoryIdx <= 18) {
    rarity = isBoss
      ? seedRoll > 0.62
        ? 'ancient'
        : 'excellent'
      : seedRoll > 0.88
        ? 'ancient'
        : seedRoll > 0.42
          ? 'excellent'
          : 'magic';
    itemLevel = isBoss ? 8 : Math.floor(seedRoll * 3) + 4;
    lifeOption = isBoss ? 12 : 8;
  } else {
    rarity = isBoss
      ? seedRoll > 0.35
        ? 'ancient'
        : 'excellent'
      : seedRoll > 0.72
        ? 'ancient'
        : seedRoll > 0.22
          ? 'excellent'
          : 'magic';
    itemLevel = isBoss
      ? Math.min(13, 9 + Math.floor(seedRoll * 4))
      : Math.floor(seedRoll * 4) + 6;
    lifeOption = isBoss ? 16 : 12;
  }

  const slotRoll = Math.random();
  const slot: ItemSlot =
    slotRoll < 0.42 ? 'weapon' : slotRoll < 0.75 ? 'armor' : 'helm';
  const tier = territoryIdx + 1;
  const cls = CLASSES[classId];

  const weaponNames: Record<CharacterClassId, string[]> = {
    dark_knight: [
      'Короткий Меч Лоренсии',
      'Клинок Изумрудной Нории',
      'Рунный Меч Эльбеланда',
      'Ледяной Клинок Девиаса',
      'Клинок Разрушения',
      'Трезубец Атланса',
      'Коса Балрога',
      'Клинок Заикана Таркана',
      'Меч Огненного Феникса',
      'Клинок Бездны Калимы',
      'Королевский Меч Лорена',
      'Божественный Меч Архангела',
    ],
    dark_wizard: [
      'Ученический Посох Лоренсии',
      'Посох Древней Нории',
      'Жезл Иллюзий Эльбеланда',
      'Ледяной Посох Девиаса',
      'Посох Души Дракона',
      'Посох Вод Атланса',
      'Посох Пламени Балрога',
      'Жезл Песков Таркана',
      'Посох Небес Икаруса',
      'Жезл Оракула Калимы',
      'Скипетр Империи Кантуру',
      'Посох Архангела Кундуна',
    ],
    fairy_elf: [
      'Короткий Лук Лоренсии',
      'Лук Королевы Нории',
      'Лук Ветров Эльбеланда',
      'Хрустальный Лук Девиаса',
      'Арбалет Святого Духа',
      'Коралловый Лук Атланса',
      'Лук Хаоса Башни',
      'Лук Золотых Песков',
      'Крылатый Лук Икаруса',
      'Арбалет Кошмара Кантуру',
      'Лук Ледяного Раклиона',
      'Божественный Арбалет Архангела',
    ],
  };

  const armorNames: Record<CharacterClassId, string[]> = {
    dark_knight: [
      'Кожаный Доспех Лоренсии',
      'Броня Стража Нории',
      'Доспех Рыцаря Эльбеланда',
      'Латы Северного Девиаса',
      'Латы Чёрного Феникса',
      'Чешуйчатый Доспех Атланса',
      'Броня Повелителя Башни',
      'Латы Пустынного Титана',
      'Доспех Небесного Дракона',
      'Броня Императора Кантуру',
      'Кираса Вечного Льда',
      'Доспех Великого Титана',
    ],
    dark_wizard: [
      'Холщовая Мантия Лоренсии',
      'Мантия Мудреца Нории',
      'Роба Туманов Эльбеланда',
      'Мантия Вьюги Девиаса',
      'Мантия Легендарного Духа',
      'Одеяние Бездны Атланса',
      'Мантия Затмения Башни',
      'Мантия Бури Таркана',
      'Одеяние Звёздного Икаруса',
      'Роба Реликвий Кантуру',
      'Мантия Пентаграмм Ахерона',
      'Мантия Вечности Кундуна',
    ],
    fairy_elf: [
      'Лёгкая Туника Лоренсии',
      'Доспех Стража Нории',
      'Туника Луны Эльбеланда',
      'Одеяние Снегов Девиаса',
      'Одеяние Красного Духа',
      'Латы Сирены Атланса',
      'Доспех Валькирии Башни',
      'Одеяние Оазиса Таркана',
      'Крылатый Доспех Икаруса',
      'Броня Стража Крайвульфа',
      'Латы Хрустальной Никси',
      'Божественные Латы Сильфиды',
    ],
  };

  const helmNames: Record<CharacterClassId, string[]> = {
    dark_knight: [
      'Кожаный Шлем Лоренсии',
      'Шлем Стража Нории',
      'Корона Эльбеланда',
      'Шлем Льдов Девиаса',
      'Шлем Чёрного Феникса',
      'Шлем Глубин Атланса',
      'Рогатый Шлем Балрога',
      'Шлем Песчаной Бури',
      'Корона Небесного Феникса',
      'Шлем Титана Кантуру',
      'Корона Фереи',
      'Корона Великого Титана',
    ],
    dark_wizard: [
      'Повязка Ученика Лоренсии',
      'Венец Нории',
      'Диадема Эльбеланда',
      'Корона Стужи Девиаса',
      'Венец Легендарного Духа',
      'Тиара Атланса',
      'Корона Затмения',
      'Венец Оракула Таркана',
      'Диадема Икаруса',
      'Венец Кошмара Кантуру',
      'Корона Ахерона',
      'Корона Вечности',
    ],
    fairy_elf: [
      'Обруч Рощи Лоренсии',
      'Диадема Стража Нории',
      'Тиара Эльбеланда',
      'Венец Льдов Девиаса',
      'Тиара Красного Духа',
      'Корона Сирены Атланса',
      'Диадема Валькирии',
      'Тиара Песков Таркана',
      'Венец Облаков Икаруса',
      'Корона Алтаря Волка',
      'Диадема Озера Никси',
      'Корона Сильфиды',
    ],
  };

  const namePool =
    slot === 'weapon'
      ? weaponNames[classId]
      : slot === 'armor'
        ? armorNames[classId]
        : helmNames[classId];
  const mappedNameIdx = Math.min(namePool.length - 1, Math.floor(territoryIdx / 2));
  const baseName = namePool[mappedNameIdx];
  const itemName =
    rarity === 'ancient'
      ? `Anc. ${baseName}`
      : rarity === 'excellent'
        ? `Exc. ${baseName}`
        : baseName;

  // Proportional base attack and defense scaling from weak Common gear in Lorencia to powerful endgame artifacts
  const proportionalBaseAttack =
    slot === 'weapon'
      ? Math.round(10 + tier * 8 + Math.pow(tier, 1.62) * 3.8 + (isBoss ? tier * 2 : 0))
      : slot === 'helm'
        ? Math.round(tier * 3)
        : 0;

  const proportionalBaseDefense =
    slot !== 'weapon'
      ? Math.round(7 + tier * 6 + Math.pow(tier, 1.56) * 2.8 + (isBoss ? Math.round(tier * 1.5) : 0))
      : 0;

  return {
    id: `drop_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    name: itemName,
    slot,
    rarity,
    level: itemLevel,
    lifeOption,
    baseAttack: proportionalBaseAttack,
    baseDefense: proportionalBaseDefense,
    critChanceBonus:
      rarity === 'ancient'
        ? 10 + Math.floor(tier / 2)
        : rarity === 'excellent'
          ? 6 + Math.floor(tier / 2)
          : rarity === 'magic'
            ? 2 + Math.floor(tier / 4)
            : 0,
    moveSpeedBonus: slot !== 'weapon' && (rarity === 'excellent' || rarity === 'ancient') ? 10 : 0,
    setName: rarity === 'ancient' || rarity === 'excellent' ? cls.setName : undefined,
    classRestriction: classId,
    excellentOption:
      rarity === 'ancient'
        ? 'Ancient Сет: +18% АТК и +20% Двойной урон (при 3+ вещах)'
        : rarity === 'excellent'
          ? slot === 'weapon'
            ? 'Excellent: +10% Крит. шанс и Урон +Уровень/20'
            : 'Excellent: Снижение урона +8% и Отражение +5%'
          : undefined,
    valueZen: (tier * 180 + itemLevel * 120) * (rarity === 'ancient' ? 4 : rarity === 'excellent' ? 2 : 1),
  };
}

export function canTerritoryDropChaos(territoryRecommendedLevel: number): boolean {
  return territoryRecommendedLevel >= 150;
}

export function rollJewelDropType(
  territoryRecommendedLevel: number,
  isBoss: boolean,
  jewelRoll = Math.random()
): 'jewel_bless' | 'jewel_soul' | 'jewel_life' | 'jewel_chaos' | null {
  // Territory Bosses always drop a jewel, and in ANY territory have a 20% chance to drop Jewel of Chaos!
  if (isBoss) {
    if (jewelRoll < 0.2) {
      return 'jewel_chaos';
    }
    if (jewelRoll < 0.5) {
      return 'jewel_life';
    }
    if (jewelRoll < 0.78) {
      return 'jewel_soul';
    }
    return 'jewel_bless';
  }

  if (jewelRoll >= 0.08) {
    return null;
  }

  const allowChaos = canTerritoryDropChaos(territoryRecommendedLevel);

  if (allowChaos) {
    if (jewelRoll < 0.022) {
      return 'jewel_chaos';
    }
    if (jewelRoll < 0.04) {
      return 'jewel_life';
    }
    if (jewelRoll < 0.06) {
      return 'jewel_soul';
    }
    return 'jewel_bless';
  }

  // Regular monsters below Level 150 territories never drop Jewel of Chaos
  if (jewelRoll < 0.024) {
    return 'jewel_life';
  }
  if (jewelRoll < 0.052) {
    return 'jewel_soul';
  }
  return 'jewel_bless';
}

export function calculateTerritoryMonsterDefense(enemyLevelMultiplier: number): number {
  if (enemyLevelMultiplier <= 1.05) return 0;
  return Math.round(Math.pow(enemyLevelMultiplier - 1, 0.86) * 16);
}

/**
 * Drops Blood Scroll (Кровавый Свиток) and Blood Fang (Кровавый Клык) from monsters
 * for crafting the Blood Castle Ticket (Invisibility Cloak) at the Chaos Goblin.
 */
export function rollBloodCastleMaterialDrop(
  isBoss: boolean,
  roll = Math.random()
): 'blood_scroll' | 'blood_fang' | null {
  if (isBoss) {
    if (roll < 0.35) return 'blood_scroll';
    if (roll < 0.7) return 'blood_fang';
    return null;
  }
  if (roll < 0.055) return 'blood_scroll';
  if (roll < 0.11) return 'blood_fang';
  return null;
}

/**
 * Crafts a Blood Castle Ticket (Invisibility Cloak / Билет в Blood Castle) at the Chaos Goblin.
 * Recipe: 1 Blood Scroll + 1 Blood Fang + 1 Jewel of Chaos.
 * Probability of success: 80% (0.80). Ingredients are consumed on attempt.
 */
export function craftBloodCastleTicket(
  state: PlayerProgressState,
  roll = Math.random()
): {
  nextState: PlayerProgressState;
  success: boolean;
  crafted: boolean;
  message: string;
} {
  if (state.bloodScrolls < 1 || state.bloodFangs < 1 || state.jewels.chaos < 1) {
    return {
      nextState: state,
      success: false,
      crafted: false,
      message: `Для варки Билета в Blood Castle нужны: 1 Blood Scroll (сейчас ${state.bloodScrolls}), 1 Blood Fang (сейчас ${state.bloodFangs}) и 1 Jewel of Chaos (сейчас ${state.jewels.chaos})!`,
    };
  }

  const nextAfterConsume: PlayerProgressState = {
    ...state,
    bloodScrolls: state.bloodScrolls - 1,
    bloodFangs: state.bloodFangs - 1,
    jewels: {
      ...state.jewels,
      chaos: state.jewels.chaos - 1,
    },
  };

  const isSuccess = roll < 0.8;
  if (!isSuccess) {
    return {
      nextState: nextAfterConsume,
      success: true,
      crafted: false,
      message:
        '🔥 Неудача синтеза (шанс 80%)! Blood Scroll, Blood Fang и Jewel of Chaos сгорели в Машине Хаоса.',
    };
  }

  return {
    nextState: {
      ...nextAfterConsume,
      bloodCastleTickets: nextAfterConsume.bloodCastleTickets + 1,
    },
    success: true,
    crafted: true,
    message:
      '✨ Синтез успешен (80%)! Вы сварили Билет в Blood Castle (Плащ Невидимости)! Откройте Телепорт [T] или нажмите «Войти в Blood Castle».',
  };
}

export function enterBloodCastle(state: PlayerProgressState): {
  nextState: PlayerProgressState;
  success: boolean;
  message: string;
} {
  if (state.inBloodCastle) {
    return {
      nextState: state,
      success: false,
      message: 'Вы уже находитесь на мосту Ивент-Зоны Blood Castle!',
    };
  }
  if (state.bloodCastleTickets < 1) {
    return {
      nextState: state,
      success: false,
      message:
        'Нужен Билет в Blood Castle! Выбейте Blood Scroll и Blood Fang с монстров и сварите билет у Гоблина Хаоса [K] (Scroll + Fang + Chaos, шанс 80%).',
    };
  }

  return {
    nextState: {
      ...state,
      bloodCastleTickets: state.bloodCastleTickets - 1,
      inBloodCastle: true,
    },
    success: true,
    message:
      '🩸 Вы вошли в Ивент-Зону BLOOD CASTLE! Этап 1/4: Убейте 100 монстров на узком мосту!',
  };
}

export function exitBloodCastle(state: PlayerProgressState): PlayerProgressState {
  return {
    ...state,
    inBloodCastle: false,
  };
}

/**
 * Rewards the hero for completing the 4-stage Blood Castle event quest
 * (100 bridge monsters -> Castle Gates -> Crystal Statue -> returning Archangel Weapon to Wounded Archangel).
 */
export function completeBloodCastleQuest(state: PlayerProgressState): {
  nextState: PlayerProgressState;
  chaosReward: number;
  expReward: number;
  zenReward: number;
  message: string;
} {
  const chaosReward = 3;
  const expReward = Math.round(calculateExpToNextLevel(state.level) * 3.5);
  const zenReward = 15000 + state.level * 150;

  const { nextState } = grantExperience(state, expReward);

  return {
    nextState: {
      ...nextState,
      zen: nextState.zen + zenReward,
      jewels: {
        ...nextState.jewels,
        chaos: nextState.jewels.chaos + chaosReward,
      },
      bloodCastleClears: nextState.bloodCastleClears + 1,
    },
    chaosReward,
    expReward,
    zenReward,
    message: `🏆 КВЕСТ АРХАНГЕЛА В BLOOD CASTLE ВЫПОЛНЕН! Награда: +${chaosReward} Jewel of Chaos, +${expReward} Опыта и +${zenReward} Zen!`,
  };
}

/**
 * Returns the monster spawn composition for a given hunting camp.
 * Regular camps spawn 8 monsters.
 * VIP camps ("один спот будет вип на котором будет появляться +2 дальнебойных моба")
 * spawn 8 regular monsters + 2 guaranteed ranged monsters (10 total)!
 */
export function getCampSpawnSpecs(camp: HuntingCampDefinition): {
  totalCount: number;
  forceRangedFlags: boolean[];
} {
  const baseCount = camp.baseMonsterCount;
  const extraRanged = camp.isVip ? camp.vipExtraRangedCount : 0;
  const flags: boolean[] = [];
  for (let i = 0; i < baseCount; i++) {
    flags.push(false);
  }
  for (let r = 0; r < extraRanged; r++) {
    flags.push(true);
  }
  return {
    totalCount: baseCount + extraRanged,
    forceRangedFlags: flags,
  };
}

/**
 * Builds a unique, stylized map layout for each territory with winding trails (тропинки),
 * wooden/iron/stone fences (заборы), rivers & wooden bridges (речки и мостики),
 * trees/camps/signposts, and 8 hunting spots where 1 spot is a VIP spot (+2 ranged mobs).
 * City 1 (Lorencia) features an authentic handcrafted MU Online pastoral kingdom layout!
 */
export function getTerritoryMapLayout(territoryId: TerritoryId): TerritoryMapLayout {
  if (territoryId === 'lorencia') {
    const camps: HuntingCampDefinition[] = [
      {
        x: 0,
        y: -1850,
        title: '👑 ВИП-СПОТ: Северное Пастбище Личей (+2 Дальних)',
        isVip: true,
        baseMonsterCount: 8,
        vipExtraRangedCount: 2,
      },
      {
        x: 2050,
        y: 0,
        title: 'Восточный Тракт у Реки Лорен',
        isVip: false,
        baseMonsterCount: 8,
        vipExtraRangedCount: 0,
      },
      {
        x: 0,
        y: 2200,
        title: 'Южная Ферма и Загоны Быков',
        isVip: false,
        baseMonsterCount: 8,
        vipExtraRangedCount: 0,
      },
      {
        x: -2350,
        y: 0,
        title: 'Западная Лесопилка Лоренсии',
        isVip: false,
        baseMonsterCount: 8,
        vipExtraRangedCount: 0,
      },
      {
        x: 2950,
        y: -2850,
        title: 'СВ Старый Погост за Мостом',
        isVip: false,
        baseMonsterCount: 8,
        vipExtraRangedCount: 0,
      },
      {
        x: -3150,
        y: -3050,
        title: 'СЗ Заброшенный Хутор',
        isVip: false,
        baseMonsterCount: 8,
        vipExtraRangedCount: 0,
      },
      {
        x: 3450,
        y: 3350,
        title: 'ЮВ Излучина Реки и Камыши',
        isVip: false,
        baseMonsterCount: 8,
        vipExtraRangedCount: 0,
      },
      {
        x: -3750,
        y: 3650,
        title: 'ЮЗ Старый Форт Рыцарей',
        isVip: false,
        baseMonsterCount: 8,
        vipExtraRangedCount: 0,
      },
    ];

    const trails: MapTrailSegment[] = [
      // North Royal Dirt Trail from North Gate to VIP Spot & NE/NW branches
      {
        style: 'dirt_trail',
        width: 86,
        points: [
          { x: 0, y: -560 },
          { x: -110, y: -980 },
          { x: 95, y: -1420 },
          { x: 0, y: -1850 },
        ],
      },
      // East River Trail from East Gate across the Wooden Bridge to East Spot
      {
        style: 'dirt_trail',
        width: 82,
        points: [
          { x: 560, y: 0 },
          { x: 950, y: 80 },
          { x: 1320, y: 0 },
          { x: 1680, y: -90 },
          { x: 2050, y: 0 },
        ],
      },
      // South Pasture Trail from South Gate to Cattle Farm
      {
        style: 'dirt_trail',
        width: 84,
        points: [
          { x: 0, y: 560 },
          { x: 130, y: 1080 },
          { x: -95, y: 1640 },
          { x: 0, y: 2200 },
        ],
      },
      // West Mill Trail from West Gate to Lumber Camp
      {
        style: 'dirt_trail',
        width: 80,
        points: [
          { x: -560, y: 0 },
          { x: -1120, y: -110 },
          { x: -1740, y: 95 },
          { x: -2350, y: 0 },
        ],
      },
      // Branch trail from North VIP Spot to NE Cemetery across North River Bridge
      {
        style: 'dirt_trail',
        width: 66,
        points: [
          { x: 0, y: -1850 },
          { x: 1180, y: -1820 },
          { x: 2100, y: -2320 },
          { x: 2950, y: -2850 },
        ],
      },
      // Branch trail from North VIP Spot to NW Homestead
      {
        style: 'dirt_trail',
        width: 66,
        points: [
          { x: 0, y: -1850 },
          { x: -1240, y: -2150 },
          { x: -2250, y: -2600 },
          { x: -3150, y: -3050 },
        ],
      },
      // Branch trail from South Farm to SE River Bend across South River Bridge
      {
        style: 'dirt_trail',
        width: 66,
        points: [
          { x: 0, y: 2200 },
          { x: 1440, y: 2240 },
          { x: 2520, y: 2790 },
          { x: 3450, y: 3350 },
        ],
      },
      // Branch trail from West Mill to SW Knight Outpost
      {
        style: 'dirt_trail',
        width: 66,
        points: [
          { x: -2350, y: 0 },
          { x: -2780, y: 1320 },
          { x: -3290, y: 2480 },
          { x: -3750, y: 3650 },
        ],
      },
    ];

    const rivers: MapRiverStream[] = [
      // The Great Lorencia Brook (Река Лорен) flowing from North-East to South-East with 3 wooden bridges
      {
        width: 145,
        waterColor: '#0f364d',
        foamColor: 'rgba(125, 211, 252, 0.45)',
        points: [
          { x: 1580, y: -5100 },
          { x: 1320, y: -3450 },
          { x: 1180, y: -1820 },
          { x: 1440, y: -880 },
          { x: 1320, y: 0 },
          { x: 1160, y: 1050 },
          { x: 1440, y: 2240 },
          { x: 1290, y: 3680 },
          { x: 1620, y: 5100 },
        ],
        bridges: [
          { x: 1320, y: 0, angle: 0, width: 195, length: 115 },
          { x: 1180, y: -1820, angle: 0, width: 185, length: 98 },
          { x: 1440, y: 2240, angle: 0, width: 185, length: 98 },
        ],
      },
      // Western Creek (Западный Ручей Лоренсии)
      {
        width: 98,
        waterColor: '#103147',
        foamColor: 'rgba(125, 211, 252, 0.36)',
        points: [
          { x: -4950, y: -1650 },
          { x: -3550, y: -1450 },
          { x: -2150, y: -1350 },
          { x: -1680, y: -740 },
          { x: -1740, y: 95 },
          { x: -1950, y: 1180 },
          { x: -1640, y: 2550 },
          { x: -2080, y: 4950 },
        ],
        bridges: [
          { x: -1740, y: 95, angle: 0, width: 145, length: 100 },
        ],
      },
    ];

    const fences: MapFenceLine[] = [
      // Wooden fences along the North Road leading to the VIP Spot
      { x1: -145, y1: -640, x2: -195, y2: -1380, style: 'wood_fence' },
      { x1: 145, y1: -640, x2: 195, y2: -1380, style: 'wood_fence' },
      // Wooden corral fences enclosing the VIP North Pasture (with gateway gap)
      { x1: -410, y1: -1520, x2: -120, y2: -1460, style: 'wood_fence' },
      { x1: 120, y1: -1460, x2: 410, y2: -1520, style: 'wood_fence' },
      { x1: -410, y1: -1520, x2: -430, y2: -2180, style: 'wood_fence' },
      { x1: 410, y1: -1520, x2: 430, y2: -2180, style: 'wood_fence' },
      // Wooden fences along the East Trail toward Lorencia River Bridge
      { x1: 640, y1: -115, x2: 1160, y2: -95, style: 'wood_fence' },
      { x1: 640, y1: 115, x2: 1160, y2: 135, style: 'wood_fence' },
      // Wooden cattle paddock fences near the South Farm Spot
      { x1: -390, y1: 1840, x2: -115, y2: 1810, style: 'wood_fence' },
      { x1: 115, y1: 1810, x2: 390, y2: 1840, style: 'wood_fence' },
      { x1: -390, y1: 1840, x2: -390, y2: 2560, style: 'wood_fence' },
      { x1: 390, y1: 1840, x2: 390, y2: 2560, style: 'wood_fence' },
      // West Lumber Mill wooden fences
      { x1: -650, y1: -125, x2: -1480, y2: -185, style: 'wood_fence' },
      { x1: -650, y1: 125, x2: -1480, y2: 165, style: 'wood_fence' },
      // Iron cemetery railings around the North-East Graveyard Spot
      { x1: 2580, y1: -2520, x2: 3320, y2: -2520, style: 'iron_railing' },
      { x1: 3320, y1: -2520, x2: 3320, y2: -3180, style: 'iron_railing' },
    ];

    const props: MapSceneryProp[] = [
      // Signposts outside the 4 Lorencia City Gates
      { x: 110, y: -635, kind: 'signpost', label: '↑ ВИП-Спот (Сев. Пастбище)' },
      { x: 645, y: -85, kind: 'signpost', label: '→ Мост через Реку Лорен' },
      { x: 115, y: 645, kind: 'signpost', label: '↓ Южные Фермы Быков' },
      { x: -645, y: -85, kind: 'signpost', label: '← Западная Лесопилка' },
      // Wooden carts, barrels, campfires & wells around Lorencia roads
      { x: -240, y: -880, kind: 'cart' },
      { x: 255, y: -1180, kind: 'campfire' },
      { x: -260, y: -1490, kind: 'barrel_cluster' },
      { x: 890, y: -180, kind: 'well' },
      { x: 1620, y: 170, kind: 'cart' },
      { x: 220, y: 950, kind: 'barrel_cluster' },
      { x: -250, y: 1380, kind: 'campfire' },
      { x: -1020, y: 210, kind: 'cart' },
      // Lush Oak & Pine Trees dotting the Lorencia pastures and riverbanks
      { x: -460, y: -790, kind: 'oak_tree' },
      { x: 480, y: -840, kind: 'oak_tree' },
      { x: -580, y: -1320, kind: 'pine_tree' },
      { x: 590, y: -1290, kind: 'oak_tree' },
      { x: 1080, y: -520, kind: 'oak_tree' },
      { x: 1060, y: 540, kind: 'oak_tree' },
      { x: 1580, y: -480, kind: 'pine_tree' },
      { x: 1590, y: 520, kind: 'oak_tree' },
      { x: -490, y: 840, kind: 'oak_tree' },
      { x: 520, y: 890, kind: 'pine_tree' },
      { x: -890, y: -560, kind: 'oak_tree' },
      { x: -940, y: 590, kind: 'pine_tree' },
      { x: -520, y: -1950, kind: 'oak_tree' },
      { x: 530, y: -1960, kind: 'oak_tree' },
      { x: 2420, y: -380, kind: 'oak_tree' },
      { x: 2450, y: 390, kind: 'pine_tree' },
    ];

    return {
      territoryId: 'lorencia',
      biomeTheme: 'lorencia_pasture',
      camps,
      trails,
      rivers,
      fences,
      props,
    };
  }

  // Distinct procedural biome layouts for the other 23 cities so every territory map looks different!
  const tIdx = Math.max(0, TERRITORIES.findIndex((t) => t.id === territoryId));
  const vipIndex = (tIdx + 1) % 8;
  const angleOffset = (tIdx * 0.28) % (Math.PI / 2);

  const baseCamps: { x: number; y: number; title: string }[] = [
    { x: 0, y: -1850, title: 'Северная Застава' },
    { x: 2050, y: 0, title: 'Восточный Рубеж' },
    { x: 0, y: 2200, title: 'Южный Форпост' },
    { x: -2350, y: 0, title: 'Западный Бастион' },
    { x: 2950, y: -2850, title: 'СВ Древний Алтарь' },
    { x: -3150, y: -3050, title: 'СЗ Проклятый Курган' },
    { x: 3450, y: 3350, title: 'ЮВ Каньон Чудовищ' },
    { x: -3750, y: 3650, title: 'ЮЗ Тёмный Цитадель' },
  ];

  const camps: HuntingCampDefinition[] = baseCamps.map((c, idx) => {
    const isVip = idx === vipIndex;
    return {
      x: c.x,
      y: c.y,
      title: isVip ? `👑 ВИП-СПОТ: ${c.title} (+2 Дальних)` : c.title,
      isVip,
      baseMonsterCount: 8,
      vipExtraRangedCount: isVip ? 2 : 0,
    };
  });

  const pathStyle: MapTrailSegment['style'] =
    territoryId === 'noria' || territoryId === 'aida'
      ? 'forest_path'
      : territoryId === 'devias' || territoryId === 'lost_tower'
        ? 'cobblestone_road'
        : 'dirt_trail';

  const trails: MapTrailSegment[] = [
    {
      style: pathStyle,
      width: 78,
      points: [
        { x: 0, y: -560 },
        { x: Math.round(Math.sin(angleOffset) * 180), y: -1200 },
        { x: 0, y: -1850 },
      ],
    },
    {
      style: pathStyle,
      width: 78,
      points: [
        { x: 560, y: 0 },
        { x: 1300, y: Math.round(Math.cos(angleOffset) * 160) },
        { x: 2050, y: 0 },
      ],
    },
    {
      style: pathStyle,
      width: 78,
      points: [
        { x: 0, y: 560 },
        { x: Math.round(-Math.sin(angleOffset) * 180), y: 1380 },
        { x: 0, y: 2200 },
      ],
    },
    {
      style: pathStyle,
      width: 78,
      points: [
        { x: -560, y: 0 },
        { x: -1450, y: Math.round(-Math.cos(angleOffset) * 160) },
        { x: -2350, y: 0 },
      ],
    },
  ];

  const riverWaterColor =
    territoryId === 'vulcanus' || territoryId === 'lost_tower' || territoryId === 'blood_castle'
      ? '#7f1d1d'
      : territoryId === 'aida' || territoryId === 'swamp_of_calmness' || territoryId === 'karutan'
        ? '#14532d'
        : territoryId === 'devias' || territoryId === 'raklion' || territoryId === 'nixies_lake'
          ? '#1e3a8a'
          : '#0f364d';

  const riverFoamColor =
    territoryId === 'vulcanus' || territoryId === 'lost_tower'
      ? 'rgba(251, 146, 60, 0.5)'
      : territoryId === 'aida' || territoryId === 'swamp_of_calmness'
        ? 'rgba(74, 222, 128, 0.4)'
        : 'rgba(125, 211, 252, 0.42)';

  const riverSide = tIdx % 2 === 0 ? 1 : -1;
  const rivers: MapRiverStream[] = [
    {
      width: 130,
      waterColor: riverWaterColor,
      foamColor: riverFoamColor,
      points: [
        { x: riverSide * 1380, y: -4900 },
        { x: riverSide * 1190, y: -2200 },
        { x: riverSide * 1300, y: 0 },
        { x: riverSide * 1160, y: 2200 },
        { x: riverSide * 1450, y: 4900 },
      ],
      bridges: [
        { x: riverSide * 1300, y: 0, angle: 0, width: 175, length: 105 },
      ],
    },
  ];

  const fenceStyle: MapFenceLine['style'] =
    tIdx % 3 === 0 ? 'wood_fence' : tIdx % 3 === 1 ? 'stone_wall' : 'iron_railing';

  const fences: MapFenceLine[] = [
    { x1: -140, y1: -640, x2: -185, y2: -1360, style: fenceStyle },
    { x1: 140, y1: -640, x2: 185, y2: -1360, style: fenceStyle },
    { x1: 640, y1: -120, x2: 1180, y2: -120, style: fenceStyle },
    { x1: 640, y1: 120, x2: 1180, y2: 120, style: fenceStyle },
  ];

  const props: MapSceneryProp[] = [
    { x: 115, y: -640, kind: 'signpost', label: `ВИП: ${camps[vipIndex].title.replace('👑 ВИП-СПОТ: ', '')}` },
    { x: -480, y: -820, kind: tIdx % 2 === 0 ? 'oak_tree' : 'pine_tree' },
    { x: 490, y: -840, kind: 'pine_tree' },
    { x: -510, y: 860, kind: 'oak_tree' },
    { x: 520, y: 880, kind: 'pine_tree' },
    { x: -240, y: -920, kind: 'campfire' },
    { x: 880, y: -190, kind: 'cart' },
  ];

  return {
    territoryId,
    biomeTheme:
      territoryId === 'noria'
        ? 'noria_forest'
        : territoryId === 'elbeland'
          ? 'elbeland_marsh'
          : territoryId === 'devias'
            ? 'devias_snow'
            : 'gothic_wilderness',
    camps,
    trails,
    rivers,
    fences,
    props,
  };
}
