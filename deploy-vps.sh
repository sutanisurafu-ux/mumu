#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "  MU: Континент Легенд — Деплой Онлайн Кооп-Сервера на VPS"
echo "=========================================================="

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "[1/2] Обнаружен Docker Compose — собираем и запускаем контейнер..."
  docker compose up -d --build
  echo "[2/2] Сервер запущен на порту 3000!"
  echo "Откройте http://<IP_ВАШЕГО_VPS>:3000/?party=MU-1 и отправьте ссылку другу!"
else
  echo "[1/3] Установка зависимостей..."
  npm install
  echo "[2/3] Сборка фронтенда (vite build)..."
  npm run build
  echo "[3/3] Запуск сервера (NODE_ENV=production PORT=3000)..."
  if command -v pm2 >/dev/null 2>&1; then
    NODE_ENV=production PORT=3000 pm2 start "node server.ts" --name mu-legends-online --update-env
    pm2 save
    echo "Сервер запущен в фоне через PM2 (pm2 logs mu-legends-online)!"
  else
    NODE_ENV=production PORT=3000 node server.ts
  fi
fi
