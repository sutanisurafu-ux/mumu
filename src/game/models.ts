import { CharacterClassId, ClassTier, EnemyEntity, EquipmentItem } from './types';

export interface HeroModelRenderOptions {
  classId: CharacterClassId;
  classTier: ClassTier;
  facingAngle: number;
  walkDistance: number;
  attackPhase: 'idle' | 'windup' | 'active' | 'recovery';
  attackTimer: number;
  hitFlash: boolean;
  weapon: EquipmentItem | null;
  armor: EquipmentItem | null;
  helm: EquipmentItem | null;
  wings: EquipmentItem | null;
  activeSetPieceCount: number;
  now: number;
  scale?: number;
}

/**
 * Renders a detailed 2.5D isometric upright MU Online hero figure (~64px tall)
 * with articulated legs, class armor cuirass/robes, horned helm/crown/tiara,
 * animated multi-pinion Chaos Wings, shield/offhand, and glowing weapon.
 */
export function drawHeroModel(
  ctx: CanvasRenderingContext2D,
  opts: HeroModelRenderOptions
): void {
  const {
    classId,
    classTier,
    facingAngle,
    walkDistance,
    attackPhase,
    hitFlash,
    weapon,
    armor,
    helm,
    wings,
    activeSetPieceCount,
    now,
    scale = 1,
  } = opts;

  ctx.save();
  ctx.scale(scale, scale);

  const isMoving = walkDistance > 0;
  const stride = Math.sin(walkDistance * 0.11);
  const idleBreath = Math.sin(now * 0.004) * 1.4;
  const bodyBob = (isMoving ? Math.abs(stride) * -2.8 : idleBreath) - 4;
  const facingRight = Math.cos(facingAngle) >= -0.15;
  const dirX = facingRight ? 1 : -1;

  const weaponLvl = weapon?.level ?? 1;
  const isExcelGlow = weaponLvl >= 3 || activeSetPieceCount >= 3;
  const isTier3Wings = wings?.rarity === 'ancient';

  // 1. ISOMETRIC GROUND SHADOW & ANCIENT SET RUNES
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isExcelGlow || wings) {
    const auraColor =
      activeSetPieceCount >= 3
        ? 'rgba(52, 211, 153, 0.65)'
        : 'rgba(251, 191, 36, 0.65)';
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 14, 28, 13, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner rotating runic diamond
    const runeA = now * 0.003;
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = runeA + (i * Math.PI) / 2;
      const rx = Math.cos(a) * 23;
      const ry = 14 + Math.sin(a) * 10;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();

    // Orbiting +9/+13 star mote
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(Math.cos(runeA * 1.6) * 26, 14 + Math.sin(runeA * 1.6) * 11, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. BACK LAYER: FLOWING CAPE & MULTI-PINION CHAOS WINGS
  ctx.save();
  ctx.translate(0, bodyBob);

  const hasArmor = armor !== null;
  const hasHelm = helm !== null;
  const hasWeapon = weapon !== null;

  if (wings) {
    const flap = Math.sin(now * 0.007) * 7;
    const span = isTier3Wings ? 54 : 44;

    if (classId === 'dark_knight') {
      // Wings of Satan / Wings of Storm: Bat-like crimson & obsidian dragon wings with bone ribs
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.scale(side, 1);
        const grad = ctx.createLinearGradient(0, -24, span, 6);
        grad.addColorStop(0, '#450a0a');
        grad.addColorStop(0.55, '#dc2626');
        grad.addColorStop(1, isTier3Wings ? '#fde047' : '#7f1d1d');

        ctx.fillStyle = grad;
        ctx.strokeStyle = isTier3Wings ? '#fef08a' : '#f87171';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(4, -18);
        ctx.quadraticCurveTo(22, -46 - flap, span, -32 - flap * 0.6);
        ctx.quadraticCurveTo(span * 0.82, -12, span * 0.92, 2);
        ctx.quadraticCurveTo(28, -4, 18, 8);
        ctx.quadraticCurveTo(10, -2, 4, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wing bone struts
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(6, -16);
        ctx.lineTo(span * 0.72, -26 - flap * 0.5);
        ctx.moveTo(6, -15);
        ctx.lineTo(span * 0.78, -6);
        ctx.stroke();
        ctx.restore();
      });
    } else if (classId === 'dark_wizard') {
      // Wings of Heaven / Wings of Eternal: Layered celestial white-azure archangel feathers
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.scale(side, 1);
        const grad = ctx.createLinearGradient(0, -24, span, 4);
        grad.addColorStop(0, '#e0f2fe');
        grad.addColorStop(0.5, '#38bdf8');
        grad.addColorStop(1, isTier3Wings ? '#c084fc' : '#1d4ed8');

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.6;

        // 3 overlapping feather pinions
        for (let p = 0; p < 3; p++) {
          const py = p * 8;
          const px = span - p * 6;
          ctx.beginPath();
          ctx.moveTo(4, -20 + py * 0.4);
          ctx.quadraticCurveTo(24, -44 - flap + py, px, -30 - flap * 0.5 + py * 1.3);
          ctx.quadraticCurveTo(px * 0.65, -8 + py, 5, -10 + py * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      });
    } else {
      // Wings of Elf / Wings of Illusion: Gossamer emerald & gold butterfly/fairy wings
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.scale(side, 1);
        const grad = ctx.createRadialGradient(14, -22, 2, 24, -20, span);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        grad.addColorStop(0.5, 'rgba(52, 211, 153, 0.85)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0.45)');

        ctx.fillStyle = grad;
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.6;

        // Upper butterfly wing
        ctx.beginPath();
        ctx.moveTo(4, -18);
        ctx.bezierCurveTo(18, -50 - flap, span + 4, -42 - flap, span * 0.85, -14);
        ctx.quadraticCurveTo(22, -10, 4, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lower fairy wing
        ctx.beginPath();
        ctx.moveTo(4, -12);
        ctx.bezierCurveTo(24, -10, span * 0.72, 14, 16, 14);
        ctx.quadraticCurveTo(8, 4, 4, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }
  } else if (hasArmor) {
    // Classic Hero Cape only when Armor is equipped
    const capeSway = Math.sin(now * 0.005 + walkDistance * 0.05) * 3;
    ctx.fillStyle =
      classId === 'dark_knight'
        ? '#7f1d1d'
        : classId === 'dark_wizard'
          ? '#1e1b4b'
          : '#064e3b';
    ctx.strokeStyle = 'rgba(212, 168, 83, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-9, -22);
    ctx.lineTo(9, -22);
    ctx.lineTo(13 + capeSway, 7);
    ctx.lineTo(-13 + capeSway, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  // 3. ARTICULATED LEGS, GREAVES & SABATONS (Bare legs when naked!)
  const leftLegY = stride * 4.5;
  const rightLegY = -stride * 4.5;
  const bootColor = !hasArmor
    ? '#d9ad7c'
    : classId === 'dark_knight'
      ? '#451a1c'
      : classId === 'dark_wizard'
        ? '#1e293b'
        : '#14532d';
  const trimColor = classTier >= 2 ? '#fde047' : '#d4a853';

  // Left Leg
  ctx.fillStyle = bootColor;
  ctx.strokeStyle = hasArmor ? trimColor : '#85582a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-9, -2 + leftLegY * 0.5, 6.5, 13, 3);
  ctx.fill();
  ctx.stroke();

  // Right Leg
  ctx.beginPath();
  ctx.roundRect(2.5, -2 + rightLegY * 0.5, 6.5, 13, 3);
  ctx.fill();
  ctx.stroke();

  // 4. TORSO CUIRASS / ROBES & BELT (Reflects equipped armor vs naked skin torso!)
  ctx.save();
  ctx.translate(0, bodyBob);

  const primaryArmor = hitFlash
    ? '#ffffff'
    : !hasArmor
      ? '#eab676'
      : classId === 'dark_knight'
        ? '#991b1b'
        : classId === 'dark_wizard'
          ? '#1d4ed8'
          : '#059669';
  const secondaryArmor = hitFlash
    ? '#ffffff'
    : !hasArmor
      ? '#c68b59'
      : classId === 'dark_knight'
        ? '#450a0a'
        : classId === 'dark_wizard'
          ? '#1e1b4b'
          : '#064e3b';

  const torsoGrad = ctx.createLinearGradient(-12, -26, 12, 2);
  torsoGrad.addColorStop(0, primaryArmor);
  torsoGrad.addColorStop(1, secondaryArmor);

  ctx.fillStyle = torsoGrad;
  ctx.strokeStyle = hasArmor ? trimColor : '#85582a';
  ctx.lineWidth = hasArmor ? 2 : 1.4;

  if (hasArmor && classId === 'dark_wizard') {
    // Flowing Soul Master Robe Torso + Tassets
    ctx.beginPath();
    ctx.moveTo(-11, -24);
    ctx.lineTo(11, -24);
    ctx.lineTo(13, 4);
    ctx.lineTo(-13, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central golden rune tabard
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-2.5, -18, 5, 20);
  } else {
    // Sculpted Plate Cuirass or Bare Muscular/Skin Torso
    ctx.beginPath();
    ctx.moveTo(-11, -25);
    ctx.lineTo(11, -25);
    ctx.lineTo(9, -2);
    ctx.lineTo(-9, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (hasArmor) {
      // Golden Chest Crest & Belt Buckle
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-6, -19);
      ctx.lineTo(0, -12);
      ctx.lineTo(6, -19);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -3, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Simple cloth waist shorts/loincloth & chest musculature contour when naked
      ctx.fillStyle = '#44372b';
      ctx.fillRect(-9, -6, 18, 5.5);
      ctx.strokeStyle = 'rgba(133, 88, 42, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-6, -16);
      ctx.lineTo(0, -14);
      ctx.lineTo(6, -16);
      ctx.moveTo(0, -14);
      ctx.lineTo(0, -7);
      ctx.stroke();
    }
  }

  // 5. LAYERED PAULDRONS (Only rendered when Armor is equipped)
  if (hasArmor) {
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(side * 13, -21);
      ctx.fillStyle = primaryArmor;
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5, 5, side * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shoulder spike for Dark Knight / Gem for Wizard & Elf
      if (classId === 'dark_knight') {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(side * 6, -9);
        ctx.lineTo(side * 2, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = classId === 'dark_wizard' ? '#38bdf8' : '#fde047';
        ctx.beginPath();
        ctx.arc(0, -1, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // 6. HEAD, FACE & CLASS HELMET / CROWN / TIARA (Reflects equipped helm vs bare head)
  ctx.save();
  ctx.translate(0, -34);

  if (!hasHelm) {
    // Unhelmeted Hero Face & Class Hairstyle
    ctx.fillStyle = hitFlash ? '#ffffff' : '#fde68a';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = classId === 'dark_wizard' ? '#38bdf8' : classId === 'fairy_elf' ? '#059669' : '#7f1d1d';
    ctx.fillRect(-4 + dirX, -1, 2.4, 2.4);
    ctx.fillRect(1.5 + dirX, -1, 2.4, 2.4);

    // Class Hair
    ctx.fillStyle =
      classId === 'dark_knight'
        ? '#1c1917'
        : classId === 'dark_wizard'
          ? '#e2e8f0'
          : '#facc15';
    ctx.beginPath();
    ctx.arc(0, -3, 8.8, Math.PI, Math.PI * 2);
    ctx.fill();
  } else if (classId === 'dark_knight') {
    // Horned Black Dragon War-Helm
    ctx.fillStyle = hitFlash ? '#ffffff' : '#7f1d1d';
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sweeping Dragon Horns
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.quadraticCurveTo(-16, -10, -14, -17);
    ctx.moveTo(7, -4);
    ctx.quadraticCurveTo(16, -10, 14, -17);
    ctx.stroke();

    // Dark Visor Slit + Blazing Eyes
    ctx.fillStyle = '#09080c';
    ctx.fillRect(-6, -2, 12, 4.5);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4.5 + dirX, -1, 3, 2.2);
    ctx.fillRect(1.5 + dirX, -1, 3, 2.2);
  } else if (classId === 'dark_wizard') {
    // Hooded Anubis Soul Master Crown
    ctx.fillStyle = hitFlash ? '#ffffff' : '#1e3a8a';
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Shadowed Face under Hood + Glowing Arcane Eyes
    ctx.fillStyle = '#09080c';
    ctx.beginPath();
    ctx.arc(dirX * 1, 1, 6.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4 + dirX, -0.5, 2.8, 2.2);
    ctx.fillRect(1.5 + dirX, -0.5, 2.8, 2.2);

    // Tall Golden Anubis Crest
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-6, -7);
    ctx.lineTo(0, -18);
    ctx.lineTo(6, -7);
    ctx.closePath();
    ctx.fill();
  } else {
    // Fairy Elf: Flowing Golden Hair, Pointed Ears, Face & Emerald Tiara
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(-dirX * 4, 3, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-14, -3);
    ctx.lineTo(-8, 3);
    ctx.moveTo(8, 0);
    ctx.lineTo(14, -3);
    ctx.lineTo(8, 3);
    ctx.fill();

    ctx.fillStyle = hitFlash ? '#ffffff' : '#fef3c7';
    ctx.strokeStyle = '#d4a853';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#059669';
    ctx.fillRect(-4 + dirX, -1, 2.4, 2.4);
    ctx.fillRect(1.5 + dirX, -1, 2.4, 2.4);

    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.lineTo(0, -13);
    ctx.lineTo(8, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 7. OFF-HAND SHIELD / ARCANE ORB & MAIN-HAND WEAPON
  const swingOffset =
    attackPhase === 'windup'
      ? -0.55
      : attackPhase === 'active'
        ? 0.75
        : 0;

  // Off-hand (left side)
  if (hasArmor && classId === 'dark_knight') {
    // Dragon Kite Shield on off-hand
    ctx.save();
    ctx.translate(-dirX * 14, -14);
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.lineTo(6, -9);
    ctx.lineTo(7, 2);
    ctx.lineTo(0, 11);
    ctx.lineTo(-7, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (hasWeapon && classId === 'dark_wizard') {
    // Floating Soul Orb on off-hand
    const orbY = -16 + Math.sin(now * 0.008) * 3;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-dirX * 16, orbY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Main-hand Weapon (or unarmed gauntlet if weapon is unequipped)
  ctx.save();
  ctx.translate(dirX * 12, -16);
  ctx.rotate(facingAngle + swingOffset);

  if (!hasWeapon) {
    // Unarmed Gauntlet Fist
    ctx.fillStyle = '#d4a853';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(4, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (classId === 'dark_knight') {
    // Detailed Great Sword of Archangel / Destruction
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -8);
    ctx.lineTo(8, 0);
    ctx.lineTo(6, 8);
    ctx.stroke();

    const bladeGrad = ctx.createLinearGradient(8, 0, 38, 0);
    bladeGrad.addColorStop(0, '#f8fafc');
    bladeGrad.addColorStop(0.5, weaponLvl >= 3 ? '#fde047' : '#cbd5e1');
    bladeGrad.addColorStop(1, weaponLvl >= 5 ? '#f97316' : '#ffffff');

    ctx.fillStyle = bladeGrad;
    ctx.strokeStyle = weaponLvl >= 3 ? '#fef08a' : '#94a3b8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(8, -3.5);
    ctx.lineTo(32, -2.5);
    ctx.lineTo(39, 0);
    ctx.lineTo(32, 2.5);
    ctx.lineTo(8, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (classId === 'dark_wizard') {
    // Grand Soul / Kundun Staff
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(32, 0, 7, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(33, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Celestial Silver Wing Bow + Drawn Energy Arrow
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(10, 0, 16, -Math.PI * 0.55, Math.PI * 0.55);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, -15);
    ctx.lineTo(4, 0);
    ctx.lineTo(12, 15);
    ctx.stroke();

    // Glowing Emerald Arrow
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(32, 0);
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
  ctx.restore();
}

/**
 * Renders detailed 2.5D upright monster models for all 4 MU Online archetypes
 * (Skeleton Warrior, Lich Necromancer, Minotaur Bull Fighter, and Demon Bosses).
 */
export function drawEnemyModel(
  ctx: CanvasRenderingContext2D,
  e: EnemyEntity,
  now: number
): void {
  ctx.save();
  ctx.translate(e.x, e.y);

  if (e.aiState === 'ko') {
    const koProgress = 1 - Math.max(0, e.koTimer / 0.35);
    ctx.globalAlpha = 1 - koProgress;
    ctx.rotate(koProgress * 1.35);
    ctx.scale(1 - koProgress * 0.28, 1 - koProgress * 0.28);
  }

  const stride = Math.sin(e.walkDistance * 0.1);
  const bob = e.aiState === 'ko' ? 0 : Math.abs(stride) * -2.5;
  const facingRight = Math.cos(e.facingAngle) >= 0;
  const dirX = facingRight ? 1 : -1;
  const isHit = e.hitFlashTimer > 0;
  const isChilled = e.chillTimer > 0;

  // Ground Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
  ctx.beginPath();
  ctx.ellipse(0, 12, e.radius * 0.95, e.radius * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  if (e.archetype === 'bc_gate') {
    // =========================================================================
    // BLOOD CASTLE GATE: MASSIVE GOTHIC IRON & STONE FORTRESS GATE ACROSS BRIDGE
    // =========================================================================
    ctx.save();
    // Gate stone pillars on left and right
    ctx.fillStyle = isHit ? '#ffffff' : '#272030';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.fillRect(-130, -85, 34, 100);
    ctx.strokeRect(-130, -85, 34, 100);
    ctx.fillRect(96, -85, 34, 100);
    ctx.strokeRect(96, -85, 34, 100);

    // Iron portcullis arch & bars
    ctx.fillStyle = isHit ? '#fecdd3' : 'rgba(30, 18, 28, 0.92)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-96, 12);
    ctx.lineTo(-96, -65);
    ctx.quadraticCurveTo(0, -105, 96, -65);
    ctx.lineTo(96, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vertical spiked iron bars
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    for (let bx = -75; bx <= 75; bx += 25) {
      ctx.beginPath();
      ctx.moveTo(bx, 12);
      ctx.lineTo(bx, -72);
      ctx.stroke();
    }

    // Glowing Crimson Seal in center of gate
    const pulse = 0.7 + Math.sin(now * 0.006) * 0.3;
    ctx.strokeStyle = `rgba(244, 63, 94, ${pulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -34, 22, 0, Math.PI * 2);
    ctx.stroke();

    // Overhead Label & HP Bar
    const hpPct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = 'rgba(9, 8, 12, 0.92)';
    ctx.fillRect(-75, -112, 150, 8);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-75, -112, 150 * hpPct, 8);
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText(e.name, 0, -118);
    ctx.restore();
    ctx.restore();
    return;
  }

  if (e.archetype === 'bc_statue') {
    // =========================================================================
    // BLOOD CASTLE CRYSTAL STATUE OF ARCHANGEL
    // =========================================================================
    ctx.save();
    // Runic Altar Base
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 10, 44, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Faceted Glowing Crystal Prism
    const floatY = Math.sin(now * 0.005) * 4;
    ctx.translate(0, floatY);
    const grad = ctx.createLinearGradient(-26, -85, 26, 5);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.5, isHit ? '#ffffff' : '#38bdf8');
    grad.addColorStop(1, '#0284c7');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -96);
    ctx.lineTo(28, -58);
    ctx.lineTo(20, 4);
    ctx.lineTo(-20, 4);
    ctx.lineTo(-28, -58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Embedded Golden Archangel Sword silhouette inside crystal
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, -76);
    ctx.lineTo(0, -18);
    ctx.moveTo(-12, -56);
    ctx.lineTo(12, -56);
    ctx.stroke();

    // Overhead Label & HP Bar
    const hpPct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = 'rgba(9, 8, 12, 0.92)';
    ctx.fillRect(-70, -118, 140, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-70, -118, 140 * hpPct, 8);
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7dd3fc';
    ctx.fillText(e.name, 0, -124);
    ctx.restore();
    ctx.restore();
    return;
  }

  if (e.isBoss) {
    // =========================================================================
    // BOSS MODEL: TOWERING DEMON LORD (GORGON / ICE QUEEN / KUNDUN)
    // =========================================================================
    // Boss Runic Magic Circle under feet
    const bossRune = now * 0.0025;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 12, e.radius * 1.25, e.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, bob);

    // Flapping Demon Bat Wings
    const wingFlap = Math.sin(now * 0.007) * 8;
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.scale(side, 1);
      ctx.fillStyle = isHit ? '#ffffff' : 'rgba(159, 18, 57, 0.88)';
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -26);
      ctx.quadraticCurveTo(38, -62 - wingFlap, 62, -38 - wingFlap * 0.5);
      ctx.quadraticCurveTo(46, -10, 52, 6);
      ctx.quadraticCurveTo(28, -4, 10, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Armored Demon Legs
    ctx.fillStyle = '#4c0519';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-13, -4 + stride * 4, 9, 16, 3);
    ctx.roundRect(4, -4 - stride * 4, 9, 16, 3);
    ctx.fill();
    ctx.stroke();

    // Massive Armored Torso
    ctx.fillStyle = isHit ? '#ffffff' : isChilled ? '#38bdf8' : '#881337';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-20, -36);
    ctx.lineTo(20, -36);
    ctx.lineTo(14, 0);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Demon Core on Chest
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -20, 6, 0, Math.PI * 2);
    ctx.fill();

    // Spiked Pauldrons
    [-1, 1].forEach((side) => {
      ctx.fillStyle = '#4c0519';
      ctx.strokeStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(side * 21, -32, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Crowned Demon Head & Giant Curved Horns
    ctx.fillStyle = isHit ? '#ffffff' : '#be123c';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -48, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-9, -53);
    ctx.quadraticCurveTo(-24, -64, -20, -74);
    ctx.moveTo(9, -53);
    ctx.quadraticCurveTo(24, -64, 20, -74);
    ctx.stroke();

    // Blazing Boss Eyes
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-6, -50, 4.5, 3);
    ctx.fillRect(2, -50, 4.5, 3);

    // Flaming Trident / Archangel Halberd
    ctx.save();
    ctx.translate(dirX * 22, -26);
    ctx.rotate(e.aiState === 'windup' ? -0.45 : e.aiState === 'active' ? 0.65 : 0.15);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(0, -34);
    ctx.stroke();
    // Trident prongs
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -24);
    ctx.lineTo(-8, -36);
    ctx.moveTo(0, -34);
    ctx.lineTo(0, -44);
    ctx.moveTo(8, -24);
    ctx.lineTo(8, -36);
    ctx.moveTo(-8, -24);
    ctx.lineTo(8, -24);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  } else if (e.archetype === 'charger_bull') {
    // =========================================================================
    // ARCHETYPE 3: MINOTAUR BULL FIGHTER (HULKING BEAST WITH BATTLEAXE)
    // =========================================================================
    ctx.save();
    ctx.translate(0, bob);

    // Cloven Hooves & Legs
    ctx.fillStyle = '#431407';
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-10, -2 + stride * 4, 7, 13, 3);
    ctx.roundRect(3, -2 - stride * 4, 7, 13, 3);
    ctx.fill();
    ctx.stroke();

    // Muscular Minotaur Torso & Iron Harness
    ctx.fillStyle = isHit ? '#ffffff' : isChilled ? '#38bdf8' : '#c2410c';
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-15, -27);
    ctx.lineTo(15, -27);
    ctx.lineTo(10, 0);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crossed Bronze Chest Chains
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -24);
    ctx.lineTo(9, -3);
    ctx.moveTo(11, -24);
    ctx.lineTo(-9, -3);
    ctx.stroke();

    // Spiked Pauldrons
    ctx.fillStyle = '#292524';
    ctx.strokeStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(-15, -23, 7, 0, Math.PI * 2);
    ctx.arc(15, -23, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bull Snout, Head, Brass Nose Ring & Long Curved Horns
    ctx.fillStyle = isHit ? '#ffffff' : '#9a3412';
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -34, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horns
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-8, -37);
    ctx.quadraticCurveTo(-19, -42, -16, -50);
    ctx.moveTo(8, -37);
    ctx.quadraticCurveTo(19, -42, 16, -50);
    ctx.stroke();

    // Glowing Red Eyes & Brass Nose Ring
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-5, -37, 3, 2.5);
    ctx.fillRect(2, -37, 3, 2.5);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -29, 3, 0, Math.PI * 2);
    ctx.stroke();

    // Double-Bladed Minotaur Greataxe
    ctx.save();
    ctx.translate(dirX * 16, -18);
    ctx.rotate(e.aiState === 'windup' ? -0.6 : e.aiState === 'active' ? 0.8 : 0.2);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, -24);
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -24);
    ctx.quadraticCurveTo(0, -16, 10, -24);
    ctx.quadraticCurveTo(12, -12, 10, -8);
    ctx.quadraticCurveTo(0, -14, -10, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  } else if (e.archetype === 'kiter_lich') {
    // =========================================================================
    // ARCHETYPE 2: LICH NECROMANCER (FLOATING HOODED MAGE WITH SKULL STAFF)
    // =========================================================================
    const floatY = Math.sin(now * 0.005 + e.x) * 4;
    ctx.save();
    ctx.translate(0, floatY);

    // Tattered Billowing Necromancer Robes
    const robeGrad = ctx.createLinearGradient(0, -28, 0, 10);
    robeGrad.addColorStop(0, isHit ? '#ffffff' : isChilled ? '#38bdf8' : '#7e22ce');
    robeGrad.addColorStop(1, '#2e1065');

    ctx.fillStyle = robeGrad;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, -25);
    ctx.lineTo(9, -25);
    ctx.lineTo(14, 8);
    ctx.lineTo(7, 4);
    ctx.lineTo(0, 10);
    ctx.lineTo(-7, 4);
    ctx.lineTo(-14, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Soul Heart on Ribcage
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -14, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Pointed Necromancer Hood & Skull Face
    ctx.fillStyle = isHit ? '#ffffff' : '#581c87';
    ctx.strokeStyle = '#d8b4fe';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, -26);
    ctx.lineTo(0, -44);
    ctx.lineTo(9, -26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#09080c';
    ctx.beginPath();
    ctx.arc(0, -31, 6, 0, Math.PI * 2);
    ctx.fill();

    // Cyan Lich Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, -32, 2.5, 2.5);
    ctx.fillRect(1.5, -32, 2.5, 2.5);

    // Skull-Tipped Necromancer Staff
    ctx.save();
    ctx.translate(dirX * 13, -14);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, -22);
    ctx.stroke();

    ctx.fillStyle = '#e9d5ff';
    ctx.beginPath();
    ctx.arc(0, -24, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2 Orbiting Spectral Soul Orbs
    const orbAngle = now * 0.0055;
    [0, Math.PI].forEach((offset) => {
      const ox = Math.cos(orbAngle + offset) * (e.radius + 7);
      const oy = -14 + Math.sin(orbAngle + offset) * 9;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  } else {
    // =========================================================================
    // ARCHETYPE 1: SKELETON WARRIOR (ARTICULATED BONES, SHIELD & SCIMITAR)
    // =========================================================================
    ctx.save();
    ctx.translate(0, bob);

    const boneColor = isHit ? '#ffffff' : isChilled ? '#7dd3fc' : e.color;

    // Articulated Bone Legs
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-5, -2);
    ctx.lineTo(-6, 10 + stride * 3.5);
    ctx.moveTo(5, -2);
    ctx.lineTo(6, 10 - stride * 3.5);
    ctx.stroke();

    // Pelvis & Spine + Ribcage Bars
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, -24);
    ctx.stroke();

    ctx.lineWidth = 2.2;
    [-19, -14, -9].forEach((ry) => {
      ctx.beginPath();
      ctx.moveTo(-7, ry);
      ctx.lineTo(7, ry);
      ctx.stroke();
    });

    // Articulated Skull Head & Jaw
    ctx.fillStyle = boneColor;
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -31, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dark Eye Sockets & Red Undead Pupils
    ctx.fillStyle = '#09080c';
    ctx.fillRect(-4.5, -33, 3.2, 3.2);
    ctx.fillRect(1.5, -33, 3.2, 3.2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3.5, -32, 1.5, 1.5);
    ctx.fillRect(2.5, -32, 1.5, 1.5);

    // Battered Iron Buckler Shield on Left Arm
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-dirX * 11, -14, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Curved Scimitar Blade on Right Arm
    ctx.save();
    ctx.translate(dirX * 10, -15);
    ctx.rotate(e.aiState === 'windup' ? -0.5 : e.aiState === 'active' ? 0.75 : 0);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.quadraticCurveTo(dirX * 10, -8, dirX * 4, -20);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Overhead Enemy HP Bar & Name Tag for Boss
  if (e.aiState !== 'ko') {
    const barW = e.isBoss ? 76 : 38;
    const barY = e.isBoss ? -76 : -48;
    const hpPct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = 'rgba(9, 8, 12, 0.88)';
    ctx.fillRect(-barW / 2, barY, barW, 5.5);
    ctx.fillStyle = e.isBoss ? '#f43f5e' : '#ef4444';
    ctx.fillRect(-barW / 2, barY, barW * hpPct, 5.5);
  }

  ctx.restore();
}

/**
 * Renders 2.5D upright Sanctuary NPC models (Chaos Goblin, Priestess Sevina, Blacksmith Hanzo, Portal Master Marlon).
 */
export function drawNpcModel(
  ctx: CanvasRenderingContext2D,
  npcType:
    | 'chaos_goblin'
    | 'priestess_sevina'
    | 'blacksmith_hanzo'
    | 'portal_guard'
    | 'wounded_archangel',
  x: number,
  y: number,
  label: string,
  now: number
): void {
  ctx.save();
  ctx.translate(x, y);

  const bob = Math.sin(now * 0.004) * 1.5;

  // Ground Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  if (npcType === 'wounded_archangel') {
    // Celestial Golden Aura Ring on floor
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 12, 32, 14, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, bob);

    // Folded / Wounded Celestial White-Gold Archangel Wings
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.scale(side, 1);
      ctx.fillStyle = 'rgba(240, 249, 255, 0.9)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(6, -20);
      ctx.quadraticCurveTo(28, -44, 38, -22);
      ctx.quadraticCurveTo(28, -4, 16, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Golden Archangel Armor & Crimson Sash
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-11, -24, 22, 26, 4);
    ctx.fill();
    ctx.stroke();

    // Radiant Halo & Hooded Head
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, -35, 13, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(0, -33, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (npcType === 'chaos_goblin') {
    // Rotating Emerald Chaos Machine Contactor Ring
    const prismRot = now * 0.003;
    ctx.save();
    ctx.translate(0, -14);
    ctx.rotate(prismRot);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -18, 36, 36);
    ctx.restore();

    // Goblin Alchemist Body & Apron
    ctx.save();
    ctx.translate(0, bob);
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-9, -22, 18, 22, 4);
    ctx.fill();
    ctx.stroke();

    // Goblin Head, Pointed Ears & Goggles
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(-7, -30);
    ctx.lineTo(-16, -34);
    ctx.lineTo(-7, -26);
    ctx.moveTo(7, -30);
    ctx.lineTo(16, -34);
    ctx.lineTo(7, -26);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -30, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Brass Goggles
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-5, -32, 4, 3);
    ctx.fillRect(1, -32, 4, 3);
    ctx.restore();
  } else if (npcType === 'priestess_sevina') {
    // Priestess Sevina: Cathedral Vestments, Golden Halo & Scroll Staff
    ctx.save();
    ctx.translate(0, bob);

    // Halo behind head
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -33, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Flowing White & Violet Vestments
    ctx.fillStyle = '#f3e8ff';
    ctx.strokeStyle = '#d4a853';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, -24);
    ctx.lineTo(9, -24);
    ctx.lineTo(13, 8);
    ctx.lineTo(-13, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9333ea';
    ctx.fillRect(-3, -22, 6, 28);

    // Head & Golden Veil
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(0, -32, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden Staff
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(13, 8);
    ctx.lineTo(13, -36);
    ctx.stroke();
    ctx.restore();
  } else if (npcType === 'blacksmith_hanzo') {
    // Blacksmith Hanzo: Heavy Anvil Pedestal, Leather Forge Apron & Glowing Hammer
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.6;
    ctx.fillRect(-24, -4, 14, 10);
    ctx.strokeRect(-24, -4, 14, 10);

    ctx.save();
    ctx.translate(0, bob);
    ctx.fillStyle = '#7c2d12';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-11, -24, 22, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Head & Iron Brow Band
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, -32, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.fillRect(-8, -36, 16, 4);

    // Forge Hammer
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.lineTo(12, -24);
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(7, -29, 10, 6);
    ctx.restore();
  } else {
    // Portal Guard Marlon: Golden Plate Armor & Teleportation Banner
    ctx.save();
    ctx.translate(0, bob);
    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -25);
    ctx.lineTo(11, -25);
    ctx.lineTo(9, 6);
    ctx.lineTo(-9, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Helm & Plume
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -33, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Portal Halberd Staff
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(14, -40);
    ctx.stroke();
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(14, -42, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Overhead NPC Title Plate
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  const tw = ctx.measureText(label).width + 12;
  ctx.fillStyle = 'rgba(9, 8, 12, 0.9)';
  ctx.fillRect(-tw / 2, -68, tw, 16);
  ctx.fillStyle =
    npcType === 'chaos_goblin'
      ? '#6ee7b7'
      : npcType === 'priestess_sevina'
        ? '#e9d5ff'
        : npcType === 'blacksmith_hanzo'
          ? '#fde047'
          : '#7dd3fc';
  ctx.fillText(label, 0, -56);

  ctx.restore();
}
