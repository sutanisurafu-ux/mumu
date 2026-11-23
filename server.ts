import crypto from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import {
  DEFAULT_PARTY_ROOM,
  INDIVIDUAL_MONSTER_RESPAWN_SEC,
  MAX_PARTY_SIZE,
  clampCoord,
  clampPositiveInt,
  electZoneHostId,
  getPartyZoneKey,
  getWorldGameTimeSec,
  isGroundLootExpired,
  sanitizeBloodCastleStage,
  sanitizeClassId,
  sanitizeClassTier,
  sanitizeDeadMonsterRespawns,
  sanitizeEnemyId,
  sanitizeGroundLootDrop,
  sanitizeHitEnemyIds,
  sanitizePartyChatText,
  sanitizePartyCode,
  sanitizePlayerNickname,
  sanitizeSharedMonsterList,
  sanitizeSkillPattern,
  sanitizeTerritoryId,
  sanitizeTradeSideOffer,
} from './src/game/party.ts';
import type {
  LootDrop,
  PartyAttackEvent,
  PartyChatMessage,
  PartyKillShareEvent,
  PartyMemberState,
  PartyZoneMonsterSnapshot,
  PlayerTradeSession,
} from './src/game/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ClientConnection {
  id: string;
  ws: WebSocket;
  roomCode: string;
  isAlive: boolean;
  msgCountWindow: number;
  windowResetAt: number;
}

interface PartyRoom {
  code: string;
  members: Map<string, PartyMemberState>;
  connections: Map<string, ClientConnection>;
  chatHistory: PartyChatMessage[];
  zoneSnapshots: Map<string, PartyZoneMonsterSnapshot>;
  zoneDeadMonsterRespawns: Map<string, Record<string, number>>;
  zoneGroundLoot: Map<string, LootDrop[]>;
  activeTrades: Map<string, PlayerTradeSession>;
}

const rooms = new Map<string, PartyRoom>();
const serverStartedAt = Date.now();

function getOrCreateRoom(code: string): PartyRoom {
  let room = rooms.get(code);
  if (!room) {
    room = {
      code,
      members: new Map(),
      connections: new Map(),
      chatHistory: [],
      zoneSnapshots: new Map(),
      zoneDeadMonsterRespawns: new Map(),
      zoneGroundLoot: new Map(),
      activeTrades: new Map(),
    };
    rooms.set(code, room);
  }
  return room;
}

function getZoneActiveGroundLoot(room: PartyRoom, zoneKey: string, nowMs = Date.now()): LootDrop[] {
  const list = room.zoneGroundLoot.get(zoneKey);
  if (!list || list.length === 0) return [];
  const filtered = list.filter((d) => !isGroundLootExpired(d, nowMs));
  if (filtered.length !== list.length) {
    room.zoneGroundLoot.set(zoneKey, filtered);
  }
  return filtered;
}

function getZoneActiveDeadRespawns(
  room: PartyRoom,
  zoneKey: string,
  nowGameSec = getWorldGameTimeSec()
): Record<string, number> {
  const map = room.zoneDeadMonsterRespawns.get(zoneKey);
  if (!map) return {};
  const cleaned: Record<string, number> = {};
  for (const [id, respawnSec] of Object.entries(map)) {
    if (respawnSec > nowGameSec) {
      cleaned[id] = respawnSec;
    }
  }
  room.zoneDeadMonsterRespawns.set(zoneKey, cleaned);
  return cleaned;
}

function sendJson(ws: WebSocket, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcastToRoom(
  room: PartyRoom,
  payload: unknown,
  excludeId?: string
): void {
  const serialized = JSON.stringify(payload);
  for (const [memberId, conn] of room.connections.entries()) {
    if (excludeId && memberId === excludeId) continue;
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(serialized);
    }
  }
}

function broadcastToSameZone(
  room: PartyRoom,
  territoryId: string,
  inBloodCastle: boolean,
  payload: unknown,
  excludeId?: string
): void {
  const serialized = JSON.stringify(payload);
  for (const [memberId, conn] of room.connections.entries()) {
    if (excludeId && memberId === excludeId) continue;
    const peer = room.members.get(memberId);
    if (!peer) continue;
    const isSameZone = inBloodCastle
      ? peer.inBloodCastle
      : !peer.inBloodCastle && peer.territoryId === territoryId;
    if (!isSameZone) continue;
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(serialized);
    }
  }
}

function cancelTradesForMember(room: PartyRoom, memberId: string, reason: string): void {
  for (const [tradeId, trade] of room.activeTrades.entries()) {
    if (trade.initiatorId === memberId || trade.targetId === memberId) {
      room.activeTrades.delete(tradeId);
      const otherId = trade.initiatorId === memberId ? trade.targetId : trade.initiatorId;
      const otherConn = room.connections.get(otherId);
      if (otherConn) {
        sendJson(otherConn.ws, {
          type: 'party:trade_cancelled',
          tradeId,
          reason,
        });
      }
    }
  }
}

function removeClientFromCurrentRoom(client: ClientConnection): void {
  if (!client.roomCode) return;
  const room = rooms.get(client.roomCode);
  if (!room) return;

  const departingMember = room.members.get(client.id);
  cancelTradesForMember(
    room,
    client.id,
    `${departingMember?.nickname ?? 'Игрок'} вышел из игры.`
  );
  room.members.delete(client.id);
  room.connections.delete(client.id);

  if (departingMember) {
    broadcastToRoom(room, {
      type: 'party:member_left',
      memberId: client.id,
      nickname: departingMember.nickname,
    });
  }

  if (room.members.size === 0 && room.connections.size === 0) {
    rooms.delete(room.code);
  }
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  // REST status endpoint for healthcheck & active party rooms summary
  app.get('/api/party/status', (_req, res) => {
    const activeRooms: {
      code: string;
      memberCount: number;
      maxMembers: number;
      members: { nickname: string; classId: string; level: number; territoryId: string }[];
    }[] = [];
    let totalOnline = 0;

    for (const room of rooms.values()) {
      if (room.members.size === 0) continue;
      totalOnline += room.members.size;
      activeRooms.push({
        code: room.code,
        memberCount: room.members.size,
        maxMembers: MAX_PARTY_SIZE,
        members: Array.from(room.members.values()).map((m) => ({
          nickname: m.nickname,
          classId: m.classId,
          level: m.level,
          territoryId: m.inBloodCastle ? 'blood_castle' : m.territoryId,
        })),
      });
    }

    res.json({
      ok: true,
      uptimeSec: Math.round((Date.now() - serverStartedAt) / 1000),
      worldGameTimeSec: Math.round(getWorldGameTimeSec()),
      totalOnline,
      activeRooms,
    });
  });

  const server = http.createServer(app);

  // Attach WebSocket server on /ws alongside HTTP on the same port (3000)
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 64 * 1024,
  });

  wss.on('connection', (ws) => {
    const clientId = `hero_${crypto.randomBytes(6).toString('hex')}`;
    const client: ClientConnection = {
      id: clientId,
      ws,
      roomCode: '',
      isAlive: true,
      msgCountWindow: 0,
      windowResetAt: Date.now() + 1000,
    };

    ws.on('pong', () => {
      client.isAlive = true;
    });

    ws.on('message', (rawBuffer) => {
      const now = Date.now();
      if (now > client.windowResetAt) {
        client.msgCountWindow = 0;
        client.windowResetAt = now + 1000;
      }
      client.msgCountWindow += 1;
      // Rate limit: max 60 packets/sec per connection
      if (client.msgCountWindow > 60) {
        return;
      }

      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(rawBuffer.toString('utf8')) as Record<string, unknown>;
      } catch {
        return;
      }

      if (!msg || typeof msg.type !== 'string') return;

      if (msg.type === 'party:join') {
        const requestedCode = sanitizePartyCode(msg.roomCode);
        const nickname = sanitizePlayerNickname(msg.nickname, `Рыцарь-${clientId.slice(-3).toUpperCase()}`);

        let targetCode = requestedCode;
        const candidateRoom = getOrCreateRoom(targetCode);
        if (
          candidateRoom.members.size >= MAX_PARTY_SIZE &&
          !candidateRoom.members.has(clientId)
        ) {
          if (requestedCode === DEFAULT_PARTY_ROOM) {
            let suffix = 2;
            while (
              getOrCreateRoom(`MU-${suffix}`).members.size >= MAX_PARTY_SIZE &&
              suffix < 50
            ) {
              suffix += 1;
            }
            targetCode = `MU-${suffix}`;
          } else {
            sendJson(ws, {
              type: 'party:error',
              message: `Пати #${requestedCode} уже заполнена (${MAX_PARTY_SIZE}/${MAX_PARTY_SIZE} игроков). Выберите другой код пати!`,
            });
            return;
          }
        }

        if (client.roomCode && client.roomCode !== targetCode) {
          removeClientFromCurrentRoom(client);
        }

        client.roomCode = targetCode;
        const room = getOrCreateRoom(targetCode);
        room.connections.set(clientId, client);

        const existing = room.members.get(clientId);
        const memberState: PartyMemberState = {
          id: clientId,
          nickname,
          roomCode: targetCode,
          classId: sanitizeClassId(msg.classId ?? existing?.classId),
          classTier: sanitizeClassTier(msg.classTier ?? existing?.classTier),
          level: clampPositiveInt(msg.level, existing?.level ?? 1, 400),
          resets: clampPositiveInt(msg.resets, existing?.resets ?? 0, 999),
          hp: clampPositiveInt(msg.hp, existing?.hp ?? 350, 100_000_000),
          maxHp: Math.max(1, clampPositiveInt(msg.maxHp, existing?.maxHp ?? 350, 100_000_000)),
          mp: clampPositiveInt(msg.mp, existing?.mp ?? 120, 100_000_000),
          maxMp: Math.max(1, clampPositiveInt(msg.maxMp, existing?.maxMp ?? 120, 100_000_000)),
          territoryId: sanitizeTerritoryId(msg.territoryId ?? existing?.territoryId),
          inBloodCastle: Boolean(msg.inBloodCastle ?? existing?.inBloodCastle),
          x: clampCoord(msg.x ?? existing?.x ?? 0),
          y: clampCoord(msg.y ?? existing?.y ?? 240),
          facingAngle: Number.isFinite(Number(msg.facingAngle))
            ? Number(msg.facingAngle)
            : 0,
          walkDistance: clampPositiveInt(msg.walkDistance, 0, 1_000_000),
          hasWeapon: Boolean(msg.hasWeapon ?? existing?.hasWeapon),
          hasWings: Boolean(msg.hasWings ?? existing?.hasWings),
          activeSkillPattern: null,
          activeSkillColor: '#fbbf24',
          activeSkillTimestamp: 0,
          lastUpdatedAt: now,
        };

        const isNewJoin = !room.members.has(clientId);
        room.members.set(clientId, memberState);

        const joinZoneKey = getPartyZoneKey(memberState.territoryId, memberState.inBloodCastle);
        const zoneChatHistory = room.chatHistory.filter((c) =>
          memberState.inBloodCastle
            ? Boolean(c.inBloodCastle)
            : !c.inBloodCastle && (c.territoryId ?? 'lorencia') === memberState.territoryId
        );

        sendJson(ws, {
          type: 'party:init',
          selfId: clientId,
          roomCode: targetCode,
          members: Array.from(room.members.values()),
          chatHistory: zoneChatHistory,
          groundLoot: getZoneActiveGroundLoot(room, joinZoneKey, now),
          deadMonsterRespawns: getZoneActiveDeadRespawns(room, joinZoneKey),
        });

        const existingZoneSnap = room.zoneSnapshots.get(joinZoneKey);
        const joinHostId = electZoneHostId(
          room.members.values(),
          clientId,
          memberState.territoryId,
          memberState.inBloodCastle
        );
        if (
          existingZoneSnap &&
          joinHostId !== clientId &&
          room.members.has(existingZoneSnap.hostId)
        ) {
          sendJson(ws, {
            type: 'party:zone_monsters',
            snapshot: {
              ...existingZoneSnap,
              deadMonsterRespawns: getZoneActiveDeadRespawns(room, joinZoneKey),
            },
          });
        }

        broadcastToRoom(
          room,
          {
            type: isNewJoin ? 'party:member_joined' : 'party:member_updated',
            member: memberState,
          },
          clientId
        );
        return;
      }

      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;
      const member = room.members.get(clientId);
      if (!member) return;

      if (msg.type === 'party:sync') {
        const prevZoneKey = getPartyZoneKey(member.territoryId, member.inBloodCastle);
        if (typeof msg.nickname === 'string') {
          member.nickname = sanitizePlayerNickname(msg.nickname, member.nickname);
        }
        member.classId = sanitizeClassId(msg.classId ?? member.classId);
        member.classTier = sanitizeClassTier(msg.classTier ?? member.classTier);
        member.level = clampPositiveInt(msg.level, member.level, 400);
        member.resets = clampPositiveInt(msg.resets, member.resets, 999);
        member.hp = clampPositiveInt(msg.hp, member.hp, 100_000_000);
        member.maxHp = Math.max(1, clampPositiveInt(msg.maxHp, member.maxHp, 100_000_000));
        member.mp = clampPositiveInt(msg.mp, member.mp, 100_000_000);
        member.maxMp = Math.max(1, clampPositiveInt(msg.maxMp, member.maxMp, 100_000_000));
        member.territoryId = sanitizeTerritoryId(msg.territoryId ?? member.territoryId);
        member.inBloodCastle = Boolean(msg.inBloodCastle);
        member.x = clampCoord(msg.x);
        member.y = clampCoord(msg.y);
        if (Number.isFinite(Number(msg.facingAngle))) {
          member.facingAngle = Number(msg.facingAngle);
        }
        if (Number.isFinite(Number(msg.walkDistance))) {
          member.walkDistance = Number(msg.walkDistance);
        }
        member.hasWeapon = Boolean(msg.hasWeapon);
        member.hasWings = Boolean(msg.hasWings);
        member.lastUpdatedAt = now;

        const nextZoneKey = getPartyZoneKey(member.territoryId, member.inBloodCastle);
        if (nextZoneKey !== prevZoneKey) {
          cancelTradesForMember(room, clientId, `${member.nickname} перешёл в другую локацию.`);

          sendJson(ws, {
            type: 'party:zone_state',
            territoryId: member.territoryId,
            inBloodCastle: member.inBloodCastle,
            groundLoot: getZoneActiveGroundLoot(room, nextZoneKey, now),
            deadMonsterRespawns: getZoneActiveDeadRespawns(room, nextZoneKey),
          });

          const snap = room.zoneSnapshots.get(nextZoneKey);
          const zoneHostId = electZoneHostId(
            room.members.values(),
            clientId,
            member.territoryId,
            member.inBloodCastle
          );
          if (snap && zoneHostId !== clientId && room.members.has(snap.hostId)) {
            sendJson(ws, {
              type: 'party:zone_monsters',
              snapshot: {
                ...snap,
                deadMonsterRespawns: getZoneActiveDeadRespawns(room, nextZoneKey),
              },
            });
          }
        }

        broadcastToRoom(
          room,
          {
            type: 'party:member_updated',
            member,
          },
          clientId
        );
        return;
      }

      if (msg.type === 'party:monsters_sync') {
        const territoryId = sanitizeTerritoryId(msg.territoryId ?? member.territoryId);
        const inBloodCastle = Boolean(msg.inBloodCastle ?? member.inBloodCastle);
        const electedHostId = electZoneHostId(
          room.members.values(),
          clientId,
          territoryId,
          inBloodCastle
        );
        if (electedHostId !== clientId) {
          return;
        }

        const zoneKey = getPartyZoneKey(territoryId, inBloodCastle);
        const incomingDead = sanitizeDeadMonsterRespawns(msg.deadMonsterRespawns);
        const currentDead = getZoneActiveDeadRespawns(room, zoneKey);
        const mergedDead = { ...currentDead, ...incomingDead };
        room.zoneDeadMonsterRespawns.set(zoneKey, mergedDead);

        const monsters = sanitizeSharedMonsterList(msg.monsters);
        const snapshot: PartyZoneMonsterSnapshot = {
          hostId: clientId,
          territoryId,
          inBloodCastle,
          bossSpawnedForTerritory: Boolean(msg.bossSpawnedForTerritory),
          bcStage: sanitizeBloodCastleStage(msg.bcStage),
          bcBridgeKills: clampPositiveInt(msg.bcBridgeKills, 0, 10_000),
          monsters,
          deadMonsterRespawns: mergedDead,
          timestamp: now,
        };

        room.zoneSnapshots.set(zoneKey, snapshot);

        broadcastToSameZone(
          room,
          territoryId,
          inBloodCastle,
          {
            type: 'party:zone_monsters',
            snapshot,
          },
          clientId
        );
        return;
      }

      if (msg.type === 'party:attack') {
        const pattern = sanitizeSkillPattern(msg.pattern) ?? 'primary';
        const skillColor =
          typeof msg.skillColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(msg.skillColor)
            ? msg.skillColor
            : '#fbbf24';

        member.activeSkillPattern = pattern;
        member.activeSkillColor = skillColor;
        member.activeSkillTimestamp = now;
        member.x = clampCoord(msg.x ?? member.x);
        member.y = clampCoord(msg.y ?? member.y);
        if (Number.isFinite(Number(msg.facingAngle))) {
          member.facingAngle = Number(msg.facingAngle);
        }

        const attackEvent: PartyAttackEvent = {
          attackerId: clientId,
          nickname: member.nickname,
          classId: member.classId,
          territoryId: member.territoryId,
          inBloodCastle: member.inBloodCastle,
          x: member.x,
          y: member.y,
          targetX: clampCoord(msg.targetX ?? member.x),
          targetY: clampCoord(msg.targetY ?? member.y),
          facingAngle: member.facingAngle,
          pattern,
          skillColor,
          damage: clampPositiveInt(msg.damage, 45, 50_000_000),
          aoeRadius: clampPositiveInt(msg.aoeRadius, 160, 650),
          hitEnemyIds: sanitizeHitEnemyIds(msg.hitEnemyIds),
          timestamp: now,
        };

        broadcastToRoom(
          room,
          {
            type: 'party:remote_attack',
            attack: attackEvent,
          },
          clientId
        );
        return;
      }

      if (msg.type === 'party:kill') {
        const monsterName =
          typeof msg.monsterName === 'string'
            ? msg.monsterName.replace(/[\u0000-\u001F<>]/g, '').slice(0, 48)
            : 'Монстр';
        const enemyId = sanitizeEnemyId(msg.enemyId);
        const nowGameSec = getWorldGameTimeSec(now);
        const respawnAtGameTimeSec =
          Number.isFinite(Number(msg.respawnAtGameTimeSec)) && Number(msg.respawnAtGameTimeSec) > nowGameSec
            ? Math.round(Number(msg.respawnAtGameTimeSec) * 100) / 100
            : Math.round((nowGameSec + INDIVIDUAL_MONSTER_RESPAWN_SEC) * 100) / 100;

        const killEvent: PartyKillShareEvent = {
          killerId: clientId,
          killerNickname: member.nickname,
          territoryId: member.territoryId,
          inBloodCastle: member.inBloodCastle,
          enemyId: enemyId || undefined,
          respawnAtGameTimeSec,
          monsterName,
          isBoss: Boolean(msg.isBoss),
          expShare: clampPositiveInt(msg.expShare, 20, 50_000_000),
          zenShare: clampPositiveInt(msg.zenShare, 15, 5_000_000),
          x: clampCoord(msg.x ?? member.x),
          y: clampCoord(msg.y ?? member.y),
          timestamp: now,
        };

        if (enemyId) {
          const zoneKey = getPartyZoneKey(member.territoryId, member.inBloodCastle);
          const deadMap = getZoneActiveDeadRespawns(room, zoneKey, nowGameSec);
          deadMap[enemyId] = respawnAtGameTimeSec;
          room.zoneDeadMonsterRespawns.set(zoneKey, deadMap);

          const snap = room.zoneSnapshots.get(zoneKey);
          if (snap) {
            snap.monsters = snap.monsters.filter((m) => m.id !== enemyId);
            snap.deadMonsterRespawns = deadMap;
          }
        }

        broadcastToRoom(
          room,
          {
            type: 'party:shared_kill',
            kill: killEvent,
          },
          clientId
        );
        return;
      }

      if (msg.type === 'party:chat') {
        const text = sanitizePartyChatText(msg.text);
        if (!text) return;

        const chatMessage: PartyChatMessage = {
          id: `msg_${crypto.randomBytes(5).toString('hex')}`,
          senderId: clientId,
          nickname: member.nickname,
          classId: member.classId,
          territoryId: member.territoryId,
          inBloodCastle: member.inBloodCastle,
          text,
          timestamp: now,
        };

        room.chatHistory.push(chatMessage);
        if (room.chatHistory.length > 50) {
          room.chatHistory.shift();
        }

        member.chatBubbleText = text;
        member.chatBubbleExpiresAt = now + 6500;

        // Broadcast chat message to everyone who is currently in the same location/territory
        sendJson(ws, {
          type: 'party:chat_message',
          message: chatMessage,
        });
        broadcastToSameZone(
          room,
          member.territoryId,
          member.inBloodCastle,
          {
            type: 'party:chat_message',
            message: chatMessage,
          },
          clientId
        );
        return;
      }

      if (msg.type === 'party:drop_item') {
        const sanitizedDrop = sanitizeGroundLootDrop(msg.drop, now);
        if (!sanitizedDrop) return;
        sanitizedDrop.droppedByNickname = member.nickname;

        const zoneKey = getPartyZoneKey(member.territoryId, member.inBloodCastle);
        const list = getZoneActiveGroundLoot(room, zoneKey, now);
        if (!list.some((d) => d.id === sanitizedDrop.id)) {
          list.push(sanitizedDrop);
          if (list.length > 64) {
            list.shift();
          }
          room.zoneGroundLoot.set(zoneKey, list);
        }

        broadcastToSameZone(
          room,
          member.territoryId,
          member.inBloodCastle,
          {
            type: 'party:ground_item_dropped',
            territoryId: member.territoryId,
            inBloodCastle: member.inBloodCastle,
            drop: sanitizedDrop,
          }
        );
        return;
      }

      if (msg.type === 'party:pickup_item') {
        const dropId = sanitizeEnemyId(msg.dropId);
        if (!dropId) return;
        const zoneKey = getPartyZoneKey(member.territoryId, member.inBloodCastle);
        const list = getZoneActiveGroundLoot(room, zoneKey, now);
        if (list.some((d) => d.id === dropId)) {
          room.zoneGroundLoot.set(
            zoneKey,
            list.filter((d) => d.id !== dropId)
          );
        }

        broadcastToSameZone(
          room,
          member.territoryId,
          member.inBloodCastle,
          {
            type: 'party:ground_item_picked',
            territoryId: member.territoryId,
            inBloodCastle: member.inBloodCastle,
            dropId,
            pickerId: clientId,
            pickerNickname: member.nickname,
          },
          clientId
        );
        return;
      }

      // PLAYER-TO-PLAYER REAL-TIME TRADE PROTOCOL
      if (msg.type === 'party:trade_request') {
        const targetId = sanitizeEnemyId(msg.targetId);
        if (!targetId || targetId === clientId) return;
        const targetMember = room.members.get(targetId);
        const targetConn = room.connections.get(targetId);
        if (!targetMember || !targetConn) {
          sendJson(ws, {
            type: 'party:error',
            message: 'Игрок для обмена не найден.',
          });
          return;
        }
        const sameZone = member.inBloodCastle
          ? targetMember.inBloodCastle
          : !targetMember.inBloodCastle && targetMember.territoryId === member.territoryId;
        if (!sameZone) {
          sendJson(ws, {
            type: 'party:error',
            message: `Трейд возможен только на одной локации! ${targetMember.nickname} находится в другой локации.`,
          });
          return;
        }

        // Cancel any previous open trades for either player
        cancelTradesForMember(room, clientId, 'Открыт новый обмен.');
        cancelTradesForMember(room, targetId, 'Открыт новый обмен.');

        const tradeId = `trd_${crypto.randomBytes(5).toString('hex')}`;
        const session: PlayerTradeSession = {
          tradeId,
          initiatorId: clientId,
          initiatorNickname: member.nickname,
          targetId,
          targetNickname: targetMember.nickname,
          territoryId: member.territoryId,
          inBloodCastle: member.inBloodCastle,
          status: 'pending',
          offers: {
            [clientId]: {
              zen: 0,
              items: [],
              jewels: { bless: 0, soul: 0, life: 0, chaos: 0 },
              locked: false,
            },
            [targetId]: {
              zen: 0,
              items: [],
              jewels: { bless: 0, soul: 0, life: 0, chaos: 0 },
              locked: false,
            },
          },
        };
        room.activeTrades.set(tradeId, session);

        sendJson(ws, {
          type: 'party:trade_updated',
          session,
        });
        sendJson(targetConn.ws, {
          type: 'party:trade_updated',
          session,
        });
        return;
      }

      if (msg.type === 'party:trade_respond') {
        const tradeId = sanitizeEnemyId(msg.tradeId);
        const accept = Boolean(msg.accept);
        const session = room.activeTrades.get(tradeId);
        if (!session) return;
        if (session.targetId !== clientId && session.initiatorId !== clientId) return;

        const initConn = room.connections.get(session.initiatorId);
        const targConn = room.connections.get(session.targetId);

        if (!accept) {
          room.activeTrades.delete(tradeId);
          if (initConn) {
            sendJson(initConn.ws, {
              type: 'party:trade_cancelled',
              tradeId,
              reason: `${member.nickname} отклонил трейд.`,
            });
          }
          if (targConn) {
            sendJson(targConn.ws, {
              type: 'party:trade_cancelled',
              tradeId,
              reason: 'Трейд отменён.',
            });
          }
          return;
        }

        session.status = 'active';
        if (initConn) {
          sendJson(initConn.ws, {
            type: 'party:trade_updated',
            session,
          });
        }
        if (targConn) {
          sendJson(targConn.ws, {
            type: 'party:trade_updated',
            session,
          });
        }
        return;
      }

      if (msg.type === 'party:trade_update_offer') {
        const tradeId = sanitizeEnemyId(msg.tradeId);
        const session = room.activeTrades.get(tradeId);
        if (!session || session.status !== 'active') return;
        if (session.initiatorId !== clientId && session.targetId !== clientId) return;

        const nextOffer = sanitizeTradeSideOffer(msg.offer);
        const prevOffer = session.offers[clientId];
        const partnerId =
          session.initiatorId === clientId ? session.targetId : session.initiatorId;

        // If the player changed their items/zen/jewels after partner locked, unlock partner to prevent bait-and-switch
        const contentChanged =
          !prevOffer ||
          prevOffer.zen !== nextOffer.zen ||
          JSON.stringify(prevOffer.jewels) !== JSON.stringify(nextOffer.jewels) ||
          JSON.stringify(prevOffer.items.map((i) => i.id)) !==
            JSON.stringify(nextOffer.items.map((i) => i.id));

        session.offers[clientId] = nextOffer;
        if (contentChanged && session.offers[partnerId]) {
          session.offers[partnerId].locked = false;
        }

        const initConn = room.connections.get(session.initiatorId);
        const targConn = room.connections.get(session.targetId);

        if (
          session.offers[session.initiatorId]?.locked &&
          session.offers[session.targetId]?.locked
        ) {
          session.status = 'completed';
          room.activeTrades.delete(tradeId);
          if (initConn) {
            sendJson(initConn.ws, {
              type: 'party:trade_completed',
              session,
            });
          }
          if (targConn) {
            sendJson(targConn.ws, {
              type: 'party:trade_completed',
              session,
            });
          }
          return;
        }

        if (initConn) {
          sendJson(initConn.ws, {
            type: 'party:trade_updated',
            session,
          });
        }
        if (targConn) {
          sendJson(targConn.ws, {
            type: 'party:trade_updated',
            session,
          });
        }
        return;
      }

      if (msg.type === 'party:trade_cancel') {
        const tradeId = sanitizeEnemyId(msg.tradeId);
        const session = room.activeTrades.get(tradeId);
        if (!session) return;
        if (session.initiatorId !== clientId && session.targetId !== clientId) return;
        room.activeTrades.delete(tradeId);

        const initConn = room.connections.get(session.initiatorId);
        const targConn = room.connections.get(session.targetId);
        if (initConn) {
          sendJson(initConn.ws, {
            type: 'party:trade_cancelled',
            tradeId,
            reason: `${member.nickname} отменил обмен.`,
          });
        }
        if (targConn) {
          sendJson(targConn.ws, {
            type: 'party:trade_cancelled',
            tradeId,
            reason: `${member.nickname} отменил обмен.`,
          });
        }
      }
    });

    ws.on('close', () => {
      removeClientFromCurrentRoom(client);
    });

    ws.on('error', () => {
      removeClientFromCurrentRoom(client);
    });
  });

  // Periodic WebSocket heartbeat, stale member cleanup & 60s ground loot expiration
  const heartbeatInterval = setInterval(() => {
    const now = Date.now();
    for (const room of rooms.values()) {
      for (const zoneKey of room.zoneGroundLoot.keys()) {
        getZoneActiveGroundLoot(room, zoneKey, now);
      }
      for (const conn of room.connections.values()) {
        if (!conn.isAlive) {
          conn.ws.terminate();
          removeClientFromCurrentRoom(conn);
          continue;
        }
        conn.isAlive = false;
        conn.ws.ping();
      }
    }
  }, 15000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });


  // Serve Vite in dev or built static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.resolve(distDir, 'index.html');
      if (!indexFile.startsWith(distDir + path.sep)) {
        res.status(403).end();
        return;
      }
      res.sendFile(indexFile);
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[MU Party Server] Running on http://0.0.0.0:${port} (WebSocket: /ws)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MU Party Server:', err);
  process.exit(1);
});
