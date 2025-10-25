# Налаштування системи квестів з повідомленнями

## Як працює система:

### 1. Маша виконує квест:

- Натискає "Надіслати поцілунок 💋" або "Надіслати бажання 💖"
- Система відправляє тобі повідомлення в Telegram бот
- Маша перенаправляється в Telegram чат з тобою

### 2. Ти отримуєш повідомлення:

```
🎯 Маша виконує квест!

📋 Квест: "Поцілунок для Максима"
📝 Тип: kiss

Перевір, чи вона це зробила, та підтверди в базі даних.

[✅ Підтвердити виконання] [❌ Не виконано]
```

### 3. Ти підтверджуєш:

- Натискаєш "✅ Підтвердити виконання" → Маша отримує Sandik монетки
- Натискаєш "❌ Не виконано" → Маша може спробувати ще раз

## Налаштування:

### 1. Налаштуй вебхук для бота:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

### 2. Альтернатива - використовуй polling:

Якщо не хочеш налаштовувати вебхук, можеш використовувати простий скрипт:

```javascript
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("callback_query", async (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (data.startsWith("verify_quest_") || data.startsWith("reject_quest_")) {
    // Відправити запит на наш API
    const response = await fetch(
      "https://your-domain.com/api/telegram/webhook",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query: callbackQuery }),
      }
    );

    if (response.ok) {
      console.log("✅ Квест оброблено!");
    }
  }
});
```

### 3. Ручне підтвердження (найпростіше):

Якщо не хочеш налаштовувати автоматизацію:

1. Маша виконує квест
2. Ти заходиш в Supabase
3. Оновлюєш `user_quests` → `is_completed = true`
4. Оновлюєш `sandik_coins` → додаєш нагороду

## Файли створені:

- ✅ `app/api/quests/notify/route.ts` - відправка повідомлень про квести
- ✅ `app/api/quests/verify/route.ts` - підтвердження квестів
- ✅ `app/api/telegram/webhook/route.ts` - обробка кнопок Telegram

## Тестування:

1. Маша натискає "Надіслати поцілунок 💋"
2. Тобі приходить повідомлення з кнопками
3. Натискаєш "✅ Підтвердити виконання"
4. Маша отримує Sandik монетки
5. Перевіряєш в QuestModal - квест позначається як виконаний
