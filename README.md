# ЛУНОХОД — Telegram Mini App

Адаптация браузерной игры под Telegram Mini Apps.

## Что уже адаптировано под Telegram

- WebApp SDK (`telegram-web-app.js`)
- Fullscreen (`expand`)
- Тёмный header / background
- Отключение вертикальных свайпов
- **MainButton** — «Начать партию» / «Продолжить» / «Сыграть ещё»
- **BackButton** — пауза / выход в меню
- Подтверждение закрытия во время партии
- Haptic feedback на ходы, осколки, опасность, game over
- «Поделиться результатом» через Telegram share
- Имя игрока из Telegram на старте
- Safe-area отступы
- Single-file сборка (`vite-plugin-singlefile`)

## Локальный запуск

```bash
npm install
npm run dev
```

## Сборка для Telegram

```bash
npm run build
```

В `dist/` будет один самодостаточный `index.html` (JS, CSS и картинка встроены внутрь).
Этого файла достаточно для публикации — отдельный сервер не нужен.

## Публикация на GitHub Pages

1. Создай **публичный** репозиторий на GitHub, например `lunohod-telegram`.
2. Запушь код в ветку `main` (workflow уже лежит в `.github/workflows/deploy-pages.yml`):

   ```bash
   git init
   git add .
   git commit -m "Lunohod Telegram Mini App"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/lunohod-telegram.git
   git push -u origin main
   ```

3. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. После первого успешного запуска workflow адрес игры будет:

   ```
   https://<USERNAME>.github.io/lunohod-telegram/
   ```

Сборка запускается автоматически на каждый push в `main`. Вручную — вкладка **Actions → Deploy to GitHub Pages → Run workflow**.

## Подключение к боту

1. Убедись, что у тебя есть бот: @BotFather → `/newbot`.
2. Открой @BotFather → выбери бота → **Bot Settings → Menu Button → Configure menu button**.
3. Отправь URL игры `https://<USERNAME>.github.io/lunohod-telegram/` и название кнопки (например, `Играть`).
4. (Опционально) там же `/newapp` — так Mini App можно открывать по прямой ссылке `t.me/<bot>/<app>`.
5. Открой бота в Telegram → нажми кнопку меню → игра запустится.

> Важно: URL должен быть **HTTPS**. GitHub Pages выдаёт HTTPS автоматически.
> Если домен `github.io` не открывается у части пользователей, игру можно переехать на Cloudflare Pages или Vercel — сборка та же (`dist/`).

## Игровые системы

- Монеты и магазин персонажей (цвета жетонов)
- 3 уровня сложности (фон + механика Тени)
- Локальные рекорды

## Структура

- `src/hooks/useTelegram.ts` — SDK
- `src/lib/game.ts` — логика + сложность
- `src/lib/characters.ts` — персонажи и монеты
- `src/components/` — UI
