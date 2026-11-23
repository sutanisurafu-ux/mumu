import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allocateStatPoint,
  buyPotionsWithZen,
  buySkillBookWithZen,
  buyStarterEquipmentWithZen,
  calculateDerivedStats,
  CLASSES,
  craftChaosWings,
  createInitialPlayerState,
  equipItemFromInventory,
  evolveCharacterClass,
  grantExperience,
  unequipItemToInventory,
  upgradeItemWithJewel,
} from './rules';

test('initial player state spawns naked with 0 learned skills, empty inventory, and fist combat stats', () => {
  const dk = createInitialPlayerState('dark_knight');
  assert.equal(dk.classId, 'dark_knight');
  assert.equal(dk.level, 1);
  assert.equal(dk.statPoints, 15);
  assert.equal(dk.hpPotions, 3);
  assert.equal(dk.mpPotions, 3);
  assert.equal(dk.hasFirstProfQuestItem, false);
  assert.equal(dk.learnedSkills.length, 0);
  assert.equal(dk.inventory.length, 0);
  assert.equal(dk.equipped.weapon, null);
  assert.equal(dk.equipped.armor, null);
  assert.equal(dk.equipped.helm, null);
  assert.equal(dk.equipped.wings, null);
  assert.equal(dk.equipped.ring, null);
  assert.equal(dk.equipped.pendant, null);

  const stats = calculateDerivedStats(dk);
  assert.equal(stats.activeSetPieceCount, 0);
  assert.ok(stats.maxHp > 200);
  assert.ok(stats.maxDamage > stats.minDamage);
});

test('buySkillBookWithZen enforces progressive level requirements and Zen prices for skill books', () => {
  const dk = createInitialPlayerState('dark_knight');
  const skills = CLASSES.dark_knight.skills;
  assert.ok(skills[0].bookPriceZen < skills[1].bookPriceZen);
  assert.ok(skills[1].bookPriceZen < skills[2].bookPriceZen);
  assert.ok(skills[2].bookPriceZen < skills[3].bookPriceZen);
  assert.ok(skills[0].requiredLevel < skills[1].requiredLevel);
  assert.ok(skills[1].requiredLevel < skills[2].requiredLevel);
  assert.ok(skills[2].requiredLevel < skills[3].requiredLevel);

  // Cannot buy Skill 1 book at Level 1 (requires Level 3)
  const tooLowLvl = buySkillBookWithZen({ ...dk, zen: 5000 }, 'cyclone_slash');
  assert.equal(tooLowLvl.success, false);

  // Can buy Skill 1 book at Level 3 for 350 Zen
  const lvl3 = buySkillBookWithZen({ ...dk, level: 3, zen: 1000 }, 'cyclone_slash');
  assert.equal(lvl3.success, true);
  assert.equal(lvl3.nextState.zen, 1000 - 350);
  assert.ok(lvl3.nextState.learnedSkills.includes('cyclone_slash'));

  // Cannot buy duplicate skill book
  const duplicate = buySkillBookWithZen(lvl3.nextState, 'cyclone_slash');
  assert.equal(duplicate.success, false);

  // Skill 4 book requires both Level 50 and 1st Profession (classTier >= 2)
  const lvl50NoProf = buySkillBookWithZen({ ...lvl3.nextState, level: 50, zen: 15000 }, 'combo_nova');
  assert.equal(lvl50NoProf.success, false);

  const lvl50WithProf = buySkillBookWithZen(
    { ...lvl3.nextState, level: 50, classTier: 2, zen: 15000 },
    'combo_nova'
  );
  assert.equal(lvl50WithProf.success, true);
  assert.ok(lvl50WithProf.nextState.learnedSkills.includes('combo_nova'));
});

test('allocating +1 and +10 stat points at once increments attributes and increases combat power', () => {
  const initial = createInitialPlayerState('dark_wizard');
  const beforeStats = calculateDerivedStats(initial);

  // Allocate +10 points at once
  const afterTen = allocateStatPoint(initial, 'ene', 10);
  assert.equal(afterTen.statPoints, 5);
  assert.equal(afterTen.attributes.ene, initial.attributes.ene + 10);

  // Allocate +1 point
  const afterEleven = allocateStatPoint(afterTen, 'ene', 1);
  assert.equal(afterEleven.statPoints, 4);
  assert.equal(afterEleven.attributes.ene, initial.attributes.ene + 11);

  const afterStats = calculateDerivedStats(afterEleven);
  assert.ok(afterStats.maxDamage > beforeStats.maxDamage);
  assert.ok(afterStats.maxMp > beforeStats.maxMp);
});

test('1st profession evolution requires Level 50 AND dropped Quest Item, and Grand Reset requires Level 300', async () => {
  const { performGrandReset } = await import('./rules');
  const initial = createInitialPlayerState('fairy_elf');
  const { nextState, leveledUp } = grantExperience(initial, 800);
  assert.equal(leveledUp, true);
  assert.ok(nextState.level >= 2);

  // Evolution fails below Level 50
  const lowLevelEvo = evolveCharacterClass(nextState);
  assert.equal(lowLevelEvo.success, false);

  // Evolution fails at Level 50 if Quest Item hasn't been looted from quest monsters
  const lvl50NoQuestItem = { ...nextState, level: 50, zen: 5000, hasFirstProfQuestItem: false };
  const missingQuestEvo = evolveCharacterClass(lvl50NoQuestItem);
  assert.equal(missingQuestEvo.success, false);

  // Evolution succeeds at Level 50 with Quest Item and consumes the Quest Item
  const lvl50WithQuestItem = { ...lvl50NoQuestItem, hasFirstProfQuestItem: true };
  const evo = evolveCharacterClass(lvl50WithQuestItem);
  assert.equal(evo.success, true);
  assert.equal(evo.nextState.classTier, 2);
  assert.equal(evo.nextState.hasFirstProfQuestItem, false);
  assert.equal(evo.nextState.statPoints, lvl50WithQuestItem.statPoints + 40);

  // Grand Reset requires Level 300
  const earlyReset = performGrandReset({ ...evo.nextState, level: 299 });
  assert.equal(earlyReset.success, false);

  const validReset = performGrandReset({ ...evo.nextState, level: 300 });
  assert.equal(validReset.success, true);
  assert.equal(validReset.nextState.resets, 1);
  assert.equal(validReset.nextState.level, 1);
  assert.equal(validReset.nextState.statPoints, evo.nextState.statPoints + 150);
});

test('buyPotionsWithZen purchases HP and MP potion packs for Zen and rejects when Zen is insufficient', () => {
  const initial = { ...createInitialPlayerState('dark_knight'), zen: 1800 };
  const buyHp5 = buyPotionsWithZen(initial, 'hp', 5);
  assert.equal(buyHp5.success, true);
  assert.equal(buyHp5.nextState.hpPotions, initial.hpPotions + 5);
  assert.equal(buyHp5.nextState.zen, initial.zen - 250);

  const buyMp20 = buyPotionsWithZen(buyHp5.nextState, 'mp', 20);
  assert.equal(buyMp20.success, true);
  assert.equal(buyMp20.nextState.mpPotions, initial.mpPotions + 20);

  const brokeState = { ...buyMp20.nextState, zen: 10 };
  const failedBuy = buyPotionsWithZen(brokeState, 'hp', 5);
  assert.equal(failedBuy.success, false);
});

test('upgradeItemWithJewel supports Bless, Soul, and Jewel of Life (+4 option)', () => {
  const initial = { ...createInitialPlayerState('dark_knight'), zen: 1500 };
  const boughtWeapon = buyStarterEquipmentWithZen(initial, 'weapon');
  assert.equal(boughtWeapon.success, true);
  const stateWithWeapon = boughtWeapon.nextState;

  const weaponId = stateWithWeapon.equipped.weapon!.id;
  const beforeLevel = stateWithWeapon.equipped.weapon!.level;
  const beforeLife = stateWithWeapon.equipped.weapon!.lifeOption;

  const blessRes = upgradeItemWithJewel(stateWithWeapon, weaponId, 'bless', 0.1);
  assert.equal(blessRes.success, true);
  assert.equal(blessRes.nextState.equipped.weapon!.level, beforeLevel + 1);

  const lifeRes = upgradeItemWithJewel(blessRes.nextState, weaponId, 'life');
  assert.equal(lifeRes.success, true);
  assert.equal(lifeRes.nextState.equipped.weapon!.lifeOption, beforeLife + 4);
});

test('craftChaosWings upgrades from Tier 2 Wings to Tier 3 Ancient Wings on second synthesis', () => {
  const initialBase = createInitialPlayerState('dark_wizard');
  // Players start with 0 Jewel of Chaos at Level 1 (Chaos drops only in 150+ territories)
  assert.equal(initialBase.jewels.chaos, 0);
  const initial = {
    ...initialBase,
    zen: 2000,
    jewels: { ...initialBase.jewels, chaos: 1 },
  };
  assert.equal(initial.equipped.wings, null);

  const firstCraft = craftChaosWings(initial);
  assert.equal(firstCraft.success, true);
  assert.equal(firstCraft.nextState.equipped.wings?.rarity, 'excellent');

  const withExtraChaos = {
    ...firstCraft.nextState,
    zen: 2000,
    jewels: { ...firstCraft.nextState.jewels, chaos: 1 },
  };
  const secondCraft = craftChaosWings(withExtraChaos);
  assert.equal(secondCraft.success, true);
  assert.equal(secondCraft.nextState.equipped.wings?.rarity, 'ancient');
});

test('unequipItemToInventory and equipItemFromInventory move items between paperdoll slots and inventory grid', () => {
  const initial = { ...createInitialPlayerState('dark_knight'), zen: 1500 };
  const withHelm = buyStarterEquipmentWithZen(initial, 'helm').nextState;
  const helmId = withHelm.equipped.helm!.id;
  const invCountBefore = withHelm.inventory.length;

  const unequipped = unequipItemToInventory(withHelm, 'helm');
  assert.equal(unequipped.success, true);
  assert.equal(unequipped.nextState.equipped.helm, null);
  assert.equal(unequipped.nextState.inventory.length, invCountBefore + 1);

  const helmInBag = unequipped.nextState.inventory.find((i) => i.id === helmId)!;
  assert.ok(helmInBag);

  const reequipped = equipItemFromInventory(unequipped.nextState, helmInBag);
  assert.equal(reequipped.success, true);
  assert.equal(reequipped.nextState.equipped.helm?.id, helmId);
  assert.equal(reequipped.nextState.inventory.length, invCountBefore);
});

test('TERRITORIES defines 24 iconic MU Online cities/regions with proportional equipment drop rarity from weak Common in early cities to Ancient in late cities', async () => {
  const { TERRITORIES, generateEquipmentDrop } = await import('./rules');
  assert.equal(TERRITORIES.length, 24);
  assert.equal(TERRITORIES[0].recommendedLevel, 1);
  assert.equal(TERRITORIES[23].recommendedLevel, 295);

  // First cities (idx 0..2: Lorencia, Noria, Elbeland) ALWAYS drop weak Common ('normal') items, even on high roll
  const city1Drop = generateEquipmentDrop('dark_knight', 0, true, 0.99);
  const city3Drop = generateEquipmentDrop('dark_knight', 2, true, 0.99);
  assert.equal(city1Drop.rarity, 'normal');
  assert.equal(city3Drop.rarity, 'normal');
  assert.equal(city1Drop.lifeOption, 0);
  assert.equal(city1Drop.setName, undefined);

  // Mid-game cities drop Magic / Excellent items with proportionally stronger stats
  const midCityDrop = generateEquipmentDrop('dark_knight', 10, true, 0.95);
  assert.equal(midCityDrop.rarity, 'excellent');
  assert.ok(
    midCityDrop.baseAttack + midCityDrop.baseDefense >
      city1Drop.baseAttack + city1Drop.baseDefense
  );

  // Late-game cities drop Ancient items with highest stats
  const lateGameDrop = generateEquipmentDrop('dark_knight', 23, true, 0.95);
  assert.equal(lateGameDrop.rarity, 'ancient');
  assert.ok(
    lateGameDrop.baseAttack + lateGameDrop.baseDefense >
      midCityDrop.baseAttack + midCityDrop.baseDefense
  );
});

test('buyShopEquipmentToInventory and buySkillBookWithZen require proximity to City Shop (isNearShop) and place items in inventory', async () => {
  const { buyShopEquipmentToInventory, getShopEquipmentCatalog } = await import('./rules');
  const dk = createInitialPlayerState('dark_knight');
  const catalog = getShopEquipmentCatalog('dark_knight');
  assert.ok(catalog.length >= 6);

  // Cannot buy equipment or skill books when far from the shop (isNearShop = false)
  const farEquip = buyShopEquipmentToInventory(dk, 'starter_weapon', false);
  assert.equal(farEquip.success, false);
  assert.equal(farEquip.nextState.inventory.length, 0);

  const farSkill = buySkillBookWithZen({ ...dk, level: 5, zen: 1000 }, 'cyclone_slash', false);
  assert.equal(farSkill.success, false);

  // When near shop (isNearShop = true), dragging equipment into inventory places it in inventory[]
  const nearEquip = buyShopEquipmentToInventory(dk, 'starter_weapon', true);
  assert.equal(nearEquip.success, true);
  assert.equal(nearEquip.nextState.inventory.length, 1);
  assert.equal(nearEquip.nextState.inventory[0].slot, 'weapon');
  assert.equal(nearEquip.nextState.equipped.weapon, null);
  assert.equal(nearEquip.nextState.zen, dk.zen - 250);
});

test('Bosses drop Jewel of Chaos with 20% chance in ANY territory while regular monsters drop Chaos only in 150+ territories', async () => {
  const {
    TERRITORIES,
    canTerritoryDropChaos,
    rollJewelDropType,
    calculateTerritoryMonsterDefense,
    performGrandReset,
  } = await import('./rules');

  for (const t of TERRITORIES) {
    // Bosses in ANY territory have a 20% chance (roll < 0.20) to drop Jewel of Chaos
    assert.equal(rollJewelDropType(t.recommendedLevel, true, 0.15), 'jewel_chaos');
    assert.notEqual(rollJewelDropType(t.recommendedLevel, true, 0.25), 'jewel_chaos');

    // Regular monsters drop Jewel of Chaos ONLY in 150+ territories
    if (t.recommendedLevel < 150) {
      assert.equal(canTerritoryDropChaos(t.recommendedLevel), false);
      assert.notEqual(rollJewelDropType(t.recommendedLevel, false, 0.001), 'jewel_chaos');
    } else {
      assert.equal(canTerritoryDropChaos(t.recommendedLevel), true);
      assert.equal(rollJewelDropType(t.recommendedLevel, false, 0.01), 'jewel_chaos');
    }
  }

  // Verify monster multipliers and defense escalate steeply with every territory
  for (let i = 1; i < TERRITORIES.length; i++) {
    const prev = TERRITORIES[i - 1];
    const curr = TERRITORIES[i];
    assert.ok(
      curr.enemyLevelMultiplier > prev.enemyLevelMultiplier * 1.25,
      `Territory ${curr.name} multiplier (${curr.enemyLevelMultiplier}) should be noticeably stronger than ${prev.name} (${prev.enemyLevelMultiplier})`
    );
    assert.ok(
      calculateTerritoryMonsterDefense(curr.enemyLevelMultiplier) >
        calculateTerritoryMonsterDefense(prev.enemyLevelMultiplier)
    );
  }

  // Verify Grand Reset provides strong multiplicative combat power motivation (+45% attack/defense + 150 stat points per Reset)
  const lvl300Hero = {
    ...createInitialPlayerState('dark_knight'),
    level: 300,
    attributes: { str: 400, agi: 250, vit: 200, ene: 100 },
  };
  const beforeResetStats = calculateDerivedStats(lvl300Hero);
  const afterReset = performGrandReset(lvl300Hero);
  assert.equal(afterReset.success, true);
  const afterResetStats = calculateDerivedStats(afterReset.nextState);
  assert.ok(afterResetStats.maxDamage > beforeResetStats.maxDamage * 1.4);
  assert.ok(afterResetStats.defense > beforeResetStats.defense * 1.4);
});

test('Blood Castle Ticket crafting uses 1 Blood Scroll + 1 Blood Fang + 1 Jewel of Chaos with 80% success rate, and quest completion awards +3 Jewel of Chaos and EXP', async () => {
  const {
    craftBloodCastleTicket,
    enterBloodCastle,
    completeBloodCastleQuest,
  } = await import('./rules');

  const base = createInitialPlayerState('dark_knight');

  // Cannot craft without Scroll, Fang, and Chaos
  const missingMats = craftBloodCastleTicket(base, 0.1);
  assert.equal(missingMats.success, false);

  const readyToCraft = {
    ...base,
    bloodScrolls: 2,
    bloodFangs: 2,
    jewels: { ...base.jewels, chaos: 2 },
  };

  // 80% success chance: roll = 0.79 succeeds and produces 1 ticket
  const successCraft = craftBloodCastleTicket(readyToCraft, 0.79);
  assert.equal(successCraft.success, true);
  assert.equal(successCraft.crafted, true);
  assert.equal(successCraft.nextState.bloodCastleTickets, 1);
  assert.equal(successCraft.nextState.bloodScrolls, 1);
  assert.equal(successCraft.nextState.bloodFangs, 1);
  assert.equal(successCraft.nextState.jewels.chaos, 1);

  // 20% failure chance: roll = 0.85 burns the 3 ingredients without granting a ticket
  const failCraft = craftBloodCastleTicket(successCraft.nextState, 0.85);
  assert.equal(failCraft.crafted, false);
  assert.equal(failCraft.nextState.bloodCastleTickets, 1);
  assert.equal(failCraft.nextState.bloodScrolls, 0);
  assert.equal(failCraft.nextState.bloodFangs, 0);
  assert.equal(failCraft.nextState.jewels.chaos, 0);

  // Entering Blood Castle consumes 1 ticket and sets inBloodCastle = true
  const entered = enterBloodCastle(failCraft.nextState);
  assert.equal(entered.success, true);
  assert.equal(entered.nextState.inBloodCastle, true);
  assert.equal(entered.nextState.bloodCastleTickets, 0);

  // Completing the 4-stage Blood Castle quest awards +3 Jewel of Chaos, massive EXP (levels up), and Zen
  const completed = completeBloodCastleQuest(entered.nextState);
  assert.equal(completed.nextState.jewels.chaos, entered.nextState.jewels.chaos + 3);
  assert.ok(completed.nextState.level > entered.nextState.level);
  assert.equal(completed.nextState.bloodCastleClears, 1);
});

test('Stylized territory map layouts include winding trails, fences, rivers with bridges, and 1 VIP spot spawning +2 extra ranged mobs', async () => {
  const {
    getTerritoryMapLayout,
    getCampSpawnSpecs,
    TERRITORIES,
  } = await import('./rules');

  const lorencia = getTerritoryMapLayout('lorencia');
  assert.equal(lorencia.territoryId, 'lorencia');
  assert.ok(lorencia.trails.length >= 6, 'Lorencia should have winding dirt trails connecting all spots');
  assert.ok(lorencia.rivers.length >= 2, 'Lorencia should have rivers/streams flowing across the map');
  assert.ok(
    lorencia.rivers.every((r) => r.bridges.length >= 1),
    'Every river in Lorencia should have wooden bridges'
  );
  assert.ok(lorencia.fences.length >= 10, 'Lorencia should have wooden pasture and road fences');
  assert.ok(lorencia.props.length >= 20, 'Lorencia should have trees, road signs, carts, and campfires');
  assert.equal(lorencia.camps.length, 8);

  const lorenciaVipCamps = lorencia.camps.filter((c) => c.isVip);
  assert.equal(lorenciaVipCamps.length, 1, 'Lorencia must have exactly 1 VIP hunting spot');

  const vipSpecs = getCampSpawnSpecs(lorenciaVipCamps[0]);
  assert.equal(vipSpecs.totalCount, 10, 'VIP spot spawns 10 monsters (8 base + 2 extra ranged)');
  assert.equal(
    vipSpecs.forceRangedFlags.filter(Boolean).length,
    2,
    'VIP spot guarantees +2 extra ranged monsters'
  );

  const regularCamp = lorencia.camps.find((c) => !c.isVip)!;
  const regularSpecs = getCampSpawnSpecs(regularCamp);
  assert.equal(regularSpecs.totalCount, 8, 'Regular spot spawns 8 monsters');
  assert.equal(regularSpecs.forceRangedFlags.filter(Boolean).length, 0);

  // Verify other cities have distinct layouts and rotated VIP spots
  const noria = getTerritoryMapLayout('noria');
  const devias = getTerritoryMapLayout('devias');
  assert.notDeepEqual(lorencia.rivers[0].points, noria.rivers[0].points);
  assert.notEqual(
    lorencia.camps.findIndex((c) => c.isVip),
    noria.camps.findIndex((c) => c.isVip)
  );
  assert.notEqual(
    noria.camps.findIndex((c) => c.isVip),
    devias.camps.findIndex((c) => c.isVip)
  );

  for (const t of TERRITORIES) {
    const layout = getTerritoryMapLayout(t.id);
    assert.equal(layout.camps.filter((c) => c.isVip).length, 1);
  }
});

test('Online Co-op Party logic sanitizes room codes and nicknames, filters same-zone allies, and grants +20% EXP bonus per party ally', async () => {
  const {
    sanitizePartyCode,
    sanitizePlayerNickname,
    sanitizePartyChatText,
    calculatePartyCoopExpBonus,
    getSameZonePartyAllies,
  } = await import('./party');

  assert.equal(sanitizePartyCode('  bro-777!@# '), 'BRO-777');
  assert.equal(sanitizePartyCode(''), 'MU-1');
  assert.equal(sanitizePlayerNickname('<script>DarkLord</script>'), 'scriptDarkLord/scr');
  assert.equal(sanitizePartyChatText('  Го на ВИП спот! \n'), 'Го на ВИП спот!');

  // Solo hunting: 0% bonus, 0 shared ally exp
  const solo = calculatePartyCoopExpBonus(100, 0);
  assert.equal(solo.bonusPct, 0);
  assert.equal(solo.killerTotalExp, 100);
  assert.equal(solo.sharedAllyExp, 0);

  // Hunting with 1 friend in the same territory: +20% killer EXP bonus and 70 shared EXP for friend
  const duo = calculatePartyCoopExpBonus(100, 1);
  assert.equal(duo.bonusPct, 20);
  assert.equal(duo.killerTotalExp, 120);
  assert.equal(duo.sharedAllyExp, 70);

  // Full 5-player party (4 allies in same zone): +80% EXP bonus
  const fullParty = calculatePartyCoopExpBonus(100, 4);
  assert.equal(fullParty.bonusPct, 80);
  assert.equal(fullParty.killerTotalExp, 180);

  const mockMembers = [
    {
      id: 'hero_1',
      nickname: 'Hero1',
      roomCode: 'MU-1',
      classId: 'dark_knight' as const,
      classTier: 1 as const,
      level: 10,
      resets: 0,
      hp: 400,
      maxHp: 400,
      mp: 150,
      maxMp: 150,
      territoryId: 'lorencia' as const,
      inBloodCastle: false,
      x: 0,
      y: 0,
      facingAngle: 0,
      walkDistance: 0,
      hasWeapon: true,
      hasWings: false,
      activeSkillPattern: null,
      activeSkillColor: '#fbbf24',
      activeSkillTimestamp: 0,
      lastUpdatedAt: Date.now(),
    },
    {
      id: 'hero_2',
      nickname: 'FriendInLorencia',
      roomCode: 'MU-1',
      classId: 'fairy_elf' as const,
      classTier: 1 as const,
      level: 12,
      resets: 0,
      hp: 380,
      maxHp: 380,
      mp: 200,
      maxMp: 200,
      territoryId: 'lorencia' as const,
      inBloodCastle: false,
      x: 120,
      y: -150,
      facingAngle: 0,
      walkDistance: 0,
      hasWeapon: true,
      hasWings: false,
      activeSkillPattern: null,
      activeSkillColor: '#34d399',
      activeSkillTimestamp: 0,
      lastUpdatedAt: Date.now(),
    },
    {
      id: 'hero_3',
      nickname: 'FriendInNoria',
      roomCode: 'MU-1',
      classId: 'dark_wizard' as const,
      classTier: 1 as const,
      level: 25,
      resets: 0,
      hp: 320,
      maxHp: 320,
      mp: 450,
      maxMp: 450,
      territoryId: 'noria' as const,
      inBloodCastle: false,
      x: 0,
      y: 0,
      facingAngle: 0,
      walkDistance: 0,
      hasWeapon: true,
      hasWings: false,
      activeSkillPattern: null,
      activeSkillColor: '#38bdf8',
      activeSkillTimestamp: 0,
      lastUpdatedAt: Date.now(),
    },
  ];

  const alliesInLorencia = getSameZonePartyAllies(mockMembers, 'hero_1', 'lorencia', false);
  assert.equal(alliesInLorencia.length, 1);
  assert.equal(alliesInLorencia[0].nickname, 'FriendInLorencia');

  const { electZoneHostId, sanitizeSharedMonsterList } = await import('./party');
  // Both hero_1 and hero_2 in Lorencia deterministically elect hero_1 as Zone Host
  const hostFromHero1 = electZoneHostId(mockMembers, 'hero_1', 'lorencia', false);
  const hostFromHero2 = electZoneHostId(mockMembers, 'hero_2', 'lorencia', false);
  assert.equal(hostFromHero1, 'hero_1');
  assert.equal(hostFromHero2, 'hero_1');

  // hero_3 alone in Noria elects hero_3 as Zone Host for Noria
  const hostInNoria = electZoneHostId(mockMembers, 'hero_3', 'noria', false);
  assert.equal(hostInNoria, 'hero_3');

  const sanitizedMobs = sanitizeSharedMonsterList([
    {
      id: 'm_0_1',
      name: '👑 ВИП Лич-Стрелок Лоренсии (Дальний)',
      archetype: 'kiter_lich',
      isBoss: false,
      isQuestMonster: true,
      x: 1380,
      y: -1380,
      campX: 1350,
      campY: -1350,
      radius: 23,
      hp: 150,
      maxHp: 175,
      attackDamage: 39,
      moveSpeed: 108,
      attackRange: 235,
      expReward: 88,
      zenReward: 150,
      color: '#fde047',
      aiState: 'move',
      telegraphX: 1380,
      telegraphY: -1380,
      facingAngle: 1.2,
      walkDistance: 45,
      chillTimer: 0,
      orbitDirection: -1,
    },
  ]);
  assert.equal(sanitizedMobs.length, 1);
  assert.equal(sanitizedMobs[0].id, 'm_0_1');
  assert.equal(sanitizedMobs[0].archetype, 'kiter_lich');
  assert.equal(sanitizedMobs[0].hp, 150);
  assert.equal(sanitizedMobs[0].maxHp, 175);
  assert.equal(sanitizedMobs[0].x, 1380);
  assert.equal(sanitizedMobs[0].orbitDirection, -1);
});



