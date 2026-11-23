import React, { useState } from 'react';
import {
  calculatePartyCoopExpBonus,
  electZoneHostId,
  getSameZonePartyAllies,
} from '../game/party';
import { TERRITORIES, getClassDisplayTitle } from '../game/rules';
import {
  PartyChatMessage,
  PartyMemberState,
  PlayerProgressState,
} from '../game/types';

interface PartyCoopModalProps {
  player: PlayerProgressState;
  selfId: string;
  nickname: string;
  roomCode: string;
  wsConnected: boolean;
  partyMembers: PartyMemberState[];
  chatMessages: PartyChatMessage[];
  errorMessage: string | null;
  onUpdateIdentity: (newNickname: string, newRoomCode: string) => void;
  onSendChat: (text: string) => void;
  onTeleportToAlly: (ally: PartyMemberState) => void;
  onClose: () => void;
}

export const PartyCoopModal: React.FC<PartyCoopModalProps> = ({
  player,
  selfId,
  nickname,
  roomCode,
  wsConnected,
  partyMembers,
  chatMessages,
  errorMessage,
  onUpdateIdentity,
  onSendChat,
  onTeleportToAlly,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'party' | 'vps_guide'>('party');
  const [nickInput, setNickInput] = useState<string>(nickname);
  const [roomInput, setRoomInput] = useState<string>(roomCode);
  const [chatInput, setChatInput] = useState<string>('');
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  const sameZoneAllies = getSameZonePartyAllies(
    partyMembers,
    selfId,
    player.territoryId,
    player.inBloodCastle
  );
  const coopBonus = calculatePartyCoopExpBonus(100, sameZoneAllies.length);
  const activeZoneHostId = electZoneHostId(
    partyMembers,
    selfId,
    player.territoryId,
    player.inBloodCastle
  );

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?party=${encodeURIComponent(roomCode)}`
      : `http://<IP_ВАШЕГО_VPS>:3000/?party=${roomCode}`;

  const handleCopyInvite = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl).catch(() => {});
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    }
  };

  const handleApplyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateIdentity(nickInput, roomInput);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput);
    setChatInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Онлайн Пати с Другом и Деплой на VPS"
    >
      <div className="gothic-panel flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-emerald-500/40">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/25 bg-[#12191c] px-5 py-3.5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono-num text-[11px] font-bold ${
                  wsConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {wsConnected ? 'WebSocket Сервер Онлайн' : 'Подключение к серверу...'}
              </span>
              <h2 className="font-display text-base font-bold text-[#fdf8ed] sm:text-xl">
                🤝 Кооп-Пати MU Online · Комната #{roomCode} ({partyMembers.length}/5)
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[#bfb5a4]">
              Бегайте вместе с другом на одной карте, бейте{' '}
              <strong className="text-amber-300">одних и тех же общих монстров и Боссов</strong>{' '}
              сообща, получайте{' '}
              <span className="font-bold text-emerald-300">
                +20% Бонус Опыта Пати за каждого союзника рядом (сейчас +{coopBonus.bonusPct}%)
              </span>{' '}
              и телепортируйтесь друг к другу!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно пати"
            className="gothic-button min-h-[42px] rounded-xl px-4 py-2 text-xs font-semibold text-amber-200 cursor-pointer"
          >
            Закрыть [O / Esc]
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 bg-[#14111d] px-5 py-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('party')}
              className={`min-h-[38px] rounded-xl px-4 py-1.5 text-xs font-bold cursor-pointer ${
                activeTab === 'party'
                  ? 'bg-emerald-500 text-[#09080c] shadow-[0_0_14px_rgba(16,185,129,0.45)]'
                  : 'gothic-button text-[#dfd7c8]'
              }`}
            >
              🤝 Состав Пати ({partyMembers.length}/5) и Чат
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vps_guide')}
              className={`min-h-[38px] rounded-xl px-4 py-1.5 text-xs font-bold cursor-pointer ${
                activeTab === 'vps_guide'
                  ? 'bg-amber-500 text-[#09080c] shadow-[0_0_14px_rgba(245,158,11,0.45)]'
                  : 'gothic-button text-amber-200'
              }`}
            >
              🚀 Деплой на свой VPS (Docker / PM2 / Nginx)
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyInvite}
            className="min-h-[36px] rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-3 py-1 font-mono-num text-xs font-bold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer"
          >
            {copiedInvite
              ? '✅ Ссылка для друга скопирована!'
              : `🔗 Скопировать ссылку в Пати #${roomCode}`}
          </button>
        </div>

        {errorMessage && (
          <div className="border-b border-rose-500/40 bg-rose-950/60 px-5 py-2 text-xs font-bold text-rose-200">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* TAB 1: ACTIVE PARTY & REAL-TIME CHAT */}
        {activeTab === 'party' ? (
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-5 lg:grid-cols-12">
            {/* Left Column: Room Settings & Party Roster */}
            <div className="flex flex-col gap-3.5 lg:col-span-7">
              <form
                onSubmit={handleApplyIdentity}
                className="rounded-xl border border-amber-500/25 bg-[#16121f] p-3.5"
              >
                <div className="font-display text-xs font-bold text-amber-300">
                  Настройка Героя и Кода Пати-Комнаты
                </div>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-mono-num text-[#bfb5a4]">
                      Ваш Никнейм над головой
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={nickInput}
                      onChange={(e) => setNickInput(e.target.value)}
                      placeholder="Ваш ник..."
                      className="mt-1 w-full rounded-lg border border-amber-500/35 bg-[#0d0a13] px-3 py-1.5 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-mono-num text-[#bfb5a4]">
                      Код Пати (одинаковый с другом)
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                      placeholder="MU-1"
                      className="mt-1 w-full rounded-lg border border-emerald-500/40 bg-[#0d0a13] px-3 py-1.5 font-mono-num text-xs font-bold text-emerald-300 uppercase focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end sm:col-span-3">
                    <button
                      type="submit"
                      className="min-h-[36px] w-full rounded-xl bg-emerald-500 px-3 py-1.5 font-display text-xs font-bold text-[#09080c] hover:bg-emerald-400 cursor-pointer"
                    >
                      Вступить
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#a99f8e]">
                  <span>
                    Ссылка для друга:{' '}
                    <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono-num text-emerald-300">
                      {inviteUrl}
                    </code>
                  </span>
                  <span className="rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono-num text-[10px] font-bold text-emerald-300">
                    🎯 Общие монстры, споты и Боссы синхронизированы
                  </span>
                </div>
              </form>

              {/* Party Members List */}
              <div className="flex flex-1 flex-col rounded-xl border border-emerald-500/25 bg-[#13181d] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-emerald-300">
                    Герои в Пати #{roomCode} ({partyMembers.length}/5)
                  </span>
                  <span className="font-mono-num text-[11px] text-amber-300">
                    Союзников в вашей локации: {sameZoneAllies.length} (+{coopBonus.bonusPct}% EXP)
                  </span>
                </div>

                <div className="mt-2.5 flex flex-col gap-2">
                  {partyMembers.map((member) => {
                    const isSelf = member.id === selfId;
                    const isMemberZoneHost = member.id === activeZoneHostId;
                    const memberTerritory =
                      TERRITORIES.find((t) => t.id === member.territoryId) ?? TERRITORIES[0];
                    const hpPct = Math.max(
                      0,
                      Math.min(100, Math.round((member.hp / Math.max(1, member.maxHp)) * 100))
                    );
                    const mpPct = Math.max(
                      0,
                      Math.min(100, Math.round((member.mp / Math.max(1, member.maxMp)) * 100))
                    );
                    const classTitle = getClassDisplayTitle(member.classId, member.classTier);

                    return (
                      <div
                        key={member.id}
                        className={`flex flex-col justify-between gap-2 rounded-xl border p-3 sm:flex-row sm:items-center ${
                          isSelf
                            ? 'border-amber-400/50 bg-[#1e192a]'
                            : 'border-emerald-500/35 bg-[#152024]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-xs font-extrabold text-white">
                              {isSelf ? `⭐ ${member.nickname} (Вы)` : `🤝 ${member.nickname}`}
                            </span>
                            <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-amber-300">
                              Ур.{member.level} {member.resets > 0 ? `· Ресет ${member.resets}` : ''}
                            </span>
                            <span className="text-[11px] text-[#c8beae]">{classTitle}</span>
                            {isMemberZoneHost && (
                              <span className="rounded border border-amber-400/40 bg-amber-500/15 px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-amber-200">
                                👑 Хост Монстров
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono-num text-[10px] text-[#afa595]">
                            <span>
                              📍{' '}
                              <strong className="text-sky-300">
                                {member.inBloodCastle
                                  ? '🩸 Blood Castle (Мост)'
                                  : memberTerritory.name}
                              </strong>
                            </span>
                            <span>·</span>
                            <span>
                              Коорд: ({member.x}, {member.y})
                            </span>
                          </div>

                          {/* HP & MP bars */}
                          <div className="mt-1.5 grid grid-cols-2 gap-2">
                            <div className="relative h-2.5 overflow-hidden rounded bg-[#1a0d12] border border-rose-500/30">
                              <div
                                style={{ width: `${hpPct}%` }}
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                              />
                              <span className="absolute inset-0 flex items-center justify-center font-mono-num text-[8px] font-bold text-white">
                                ОЗ {member.hp}/{member.maxHp}
                              </span>
                            </div>
                            <div className="relative h-2.5 overflow-hidden rounded bg-[#0d1424] border border-sky-500/30">
                              <div
                                style={{ width: `${mpPct}%` }}
                                className="h-full bg-gradient-to-r from-blue-600 to-sky-400"
                              />
                              <span className="absolute inset-0 flex items-center justify-center font-mono-num text-[8px] font-bold text-white">
                                МН {member.mp}/{member.maxMp}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => onTeleportToAlly(member)}
                            className="min-h-[38px] shrink-0 rounded-xl bg-emerald-500 px-3 py-1.5 font-display text-xs font-bold text-[#09080c] hover:bg-emerald-400 cursor-pointer whitespace-nowrap"
                          >
                            ⚡ ТП к другу
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {partyMembers.length <= 1 && (
                    <div className="rounded-xl border border-dashed border-emerald-500/30 bg-[#0e1417] p-3 text-xs text-[#bfb5a4]">
                      💡 Сейчас вы в Пати <strong>#{roomCode}</strong> один. Отправьте другу ссылку{' '}
                      <code className="text-emerald-300">{inviteUrl}</code> (или откройте вторую
                      вкладку браузера для теста!) — друг сразу появится рядом с вами на карте и
                      мини-карте!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live Party Chat */}
            <div className="flex flex-col rounded-xl border border-amber-500/25 bg-[#15111e] p-3.5 lg:col-span-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-display text-xs font-bold text-amber-300">
                  💬 Чат Пати #{roomCode}
                </span>
                <span className="text-[10px] text-[#9e9484]">
                  Сообщения видны и над головой героя!
                </span>
              </div>

              <div className="my-2.5 flex h-[250px] flex-1 flex-col gap-1.5 overflow-y-auto rounded-lg bg-[#0c0a12] p-2.5 font-mono-num text-xs">
                {chatMessages.length === 0 ? (
                  <div className="m-auto text-center text-[11px] text-[#7c7365]">
                    Напишите сообщение другу — оно появится в чате и в виде облачка текста над вашим
                    персонажем на карте!
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="leading-relaxed">
                      <span
                        className={`font-bold ${
                          msg.senderId === selfId ? 'text-amber-300' : 'text-emerald-300'
                        }`}
                      >
                        [{msg.nickname}]:
                      </span>{' '}
                      <span className="text-[#ece5d8]">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={140}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Написать в чат пати..."
                  className="flex-1 rounded-xl border border-amber-500/35 bg-[#0c0a12] px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="min-h-[38px] rounded-xl bg-amber-500 px-3.5 py-2 font-display text-xs font-bold text-[#09080c] hover:bg-amber-400 cursor-pointer"
                >
                  Отправить
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* TAB 2: VPS DEPLOYMENT GUIDE */
          <div className="flex-1 overflow-y-auto p-5 text-xs text-[#dfd7c8]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/30 bg-[#13191d] p-4">
                <h3 className="font-display text-sm font-bold text-emerald-300">
                  Вариант 1: Быстрый деплой на VPS через Docker Compose (Рекомендуется)
                </h3>
                <p className="mt-1 text-[11px] text-[#bfb5a4]">
                  В корень проекта уже добавлены готовые <code>Dockerfile</code>,{' '}
                  <code>docker-compose.yml</code> и скрипт <code>deploy-vps.sh</code>.
                </p>
                <pre className="mt-2.5 overflow-x-auto rounded-lg bg-black/70 p-3 font-mono-num text-[11px] text-emerald-200">
{`# 1. Склонируйте или загрузите проект на ваш VPS:
git clone <ваш-репозиторий> mu-legends && cd mu-legends

# 2. Запустите сборку и сервер в фоне (порт 3000):
docker compose up -d --build

# Или одной командой через скрипт:
bash deploy-vps.sh`}
                </pre>
                <p className="mt-2 text-[11px] text-amber-200">
                  После запуска откройте{' '}
                  <code>http://&lt;IP_ВАШЕГО_VPS&gt;:3000/?party=MU-1</code> и скиньте ссылку другу!
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-[#171320] p-4">
                <h3 className="font-display text-sm font-bold text-amber-300">
                  Вариант 2: Запуск на VPS без Docker (Node.js 22+ и PM2)
                </h3>
                <p className="mt-1 text-[11px] text-[#bfb5a4]">
                  Сервер <code>server.ts</code> одновременно раздаёт собранный фронтенд{' '}
                  <code>dist/</code> и обрабатывает WebSocket <code>/ws</code> для коопа на одном
                  порту <code>3000</code>.
                </p>
                <pre className="mt-2.5 overflow-x-auto rounded-lg bg-black/70 p-3 font-mono-num text-[11px] text-amber-200">
{`# 1. Установите зависимости и соберите фронтенд:
npm install
npm run build

# 2. Запустите продакшн-сервер через PM2:
npm install -g pm2
NODE_ENV=production PORT=3000 pm2 start "npm start" --name mu-online
pm2 save && pm2 startup`}
                </pre>
              </div>

              <div className="rounded-xl border border-sky-500/30 bg-[#121722] p-4 md:col-span-2">
                <h3 className="font-display text-sm font-bold text-sky-300">
                  Конфиг Nginx для домена и HTTPS (с поддержкой WebSocket /ws)
                </h3>
                <p className="mt-1 text-[11px] text-[#bfb5a4]">
                  Если вы проксируете игру через Nginx на свой домен, обязательно добавьте заголовки{' '}
                  <code>Upgrade</code> и <code>Connection &quot;upgrade&quot;</code> для локации{' '}
                  <code>/ws</code>:
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-black/70 p-3 font-mono-num text-[11px] text-sky-200">
{`server {
    listen 80;
    server_name mu.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://127.0.0.1:3000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
