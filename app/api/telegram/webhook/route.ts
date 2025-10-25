import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle webhook data

    // Handle callback queries (button presses)
    if (body.callback_query) {
      const callbackData = body.callback_query.data;
      const chatId = body.callback_query.message.chat.id;
      const messageId = body.callback_query.message.message_id;

      // Parse callback data: "verify_quest_questId" or "reject_quest_questId"
      if (callbackData.startsWith("verify_quest_")) {
        const questId = callbackData.replace("verify_quest_", "");
        const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's ID

        // Get quest details
        const { data: quest, error: questError } = await supabaseAdmin
          .from("quests")
          .select("*")
          .eq("id", questId)
          .single();

        if (questError || !quest) {
          await sendTelegramMessage(chatId, "❌ Помилка: квест не знайдено");
          return NextResponse.json({ success: true });
        }

        // Mark quest as completed
        const { error: completeError } = await supabaseAdmin
          .from("user_quests")
          .upsert({
            user_id: userId,
            quest_id: questId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (completeError) {
          await sendTelegramMessage(
            chatId,
            "❌ Помилка бази даних при виконанні квесту"
          );
          return NextResponse.json({ success: true });
        }

        // Add Sandik coins to user
        // Спочатку перевіряємо, чи існує запис
        const { data: existingCoins, error: fetchError } = await supabaseAdmin
          .from("sandik_coins")
          .select("amount")
          .eq("user_id", userId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // Якщо запис не існує, створюємо новий
          const { error: insertError } = await supabaseAdmin
            .from("sandik_coins")
            .insert({
              user_id: userId,
              amount: quest.sandik_reward,
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            await sendTelegramMessage(
              chatId,
              "❌ Помилка створення запису Sandik монеток"
            );
            return NextResponse.json({ success: true });
          }
        } else {
          // Якщо запис існує, оновлюємо його
          const newAmount = (existingCoins?.amount || 0) + quest.sandik_reward;
          const { error: updateError } = await supabaseAdmin
            .from("sandik_coins")
            .update({
              amount: newAmount,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (updateError) {
            await sendTelegramMessage(
              chatId,
              "❌ Помилка оновлення Sandik монеток"
            );
            return NextResponse.json({ success: true });
          }
        }

        // Send confirmation
        await sendTelegramMessage(
          chatId,
          `✅ Квест "${quest.title}" підтверджено!\n\n💰 Маша отримала ${quest.sandik_reward} Sandik монеток!`
        );
      } else if (callbackData.startsWith("reject_quest_")) {
        await sendTelegramMessage(
          chatId,
          "❌ Квест не підтверджено. Маша може спробувати ще раз."
        );
      }

      // Answer the callback query to remove loading state
      await answerCallbackQuery(body.callback_query.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  if (!process.env.BOT_TOKEN) return;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      }
    );

    if (!response.ok) {
      // Silent error handling
    }
  } catch (error) {
    // Silent error handling
  }
}

async function answerCallbackQuery(callbackQueryId: string) {
  if (!process.env.BOT_TOKEN) return;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
        }),
      }
    );

    if (!response.ok) {
      // Silent error handling
    }
  } catch (error) {
    // Silent error handling
  }
}
