# Дівочі мрії 💖

Простий Next.js 14 додаток, який дозволяє користувачам надсилати повідомлення в Telegram чат через бота.

## Налаштування

1. Встановіть залежності:

```bash
npm install
```

2. Створіть файл `.env.local` з вашими Telegram bot credentials:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

3. Запустіть сервер розробки:

```bash
npm run dev
```

4. Відкрийте [http://localhost:3000](http://localhost:3000) у браузері.

## Розгортання на Vercel

1. Завантажте ваш код на GitHub
2. Підключіть ваш репозиторій до Vercel
3. Додайте змінні середовища в Vercel dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. Розгорніть!

## Отримання Telegram Bot Token

1. Напишіть [@BotFather](https://t.me/botfather) в Telegram
2. Використайте команду `/newbot`
3. Дотримуйтесь інструкцій для створення вашого бота
4. Скопіюйте bot token

## Отримання Chat ID

1. Додайте вашого бота до чату
2. Надішліть повідомлення в чат
3. Відвідайте: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Знайдіть `chat.id` в відповіді

## Функції

- 🎨 Красивий градієнтний дизайн
- 💖 Анімація серця
- 📱 Адаптивний дизайн
- ⚡ Швидка відправка повідомлень
- ✅ Підтвердження відправки
- 🔒 Безпечна обробка помилок

## Технології

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Telegram Bot API
