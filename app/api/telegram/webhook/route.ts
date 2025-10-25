import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const { data, message } = update.callback_query;
      const chatId = message.chat.id;

      console.log("Received callback:", data);

      if (data.startsWith("verify_quest_")) {
        const questId = data.replace("verify_quest_", "");

        // Call our verify API
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
          }/api/quests/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questId: questId,
              action: "verify",
            }),
          }
        );

        if (response.ok) {
          // Answer the callback query
          await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                callback_query_id: update.callback_query.id,
                text: "✅ Квест підтверджено!",
              }),
            }
          );
        }
      } else if (data.startsWith("reject_quest_")) {
        const questId = data.replace("reject_quest_", "");

        // Call our verify API with reject action
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
          }/api/quests/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questId: questId,
              action: "reject",
            }),
          }
        );

        if (response.ok) {
          // Answer the callback query
          await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                callback_query_id: update.callback_query.id,
                text: "❌ Квест не підтверджено",
              }),
            }
          );
        }
      }

      return NextResponse.json({ success: true });
    }

    // Handle regular messages
    if (update.message) {
      const { text, chat } = update.message;

      // You can add logic here to handle messages from Maria
      // For now, just acknowledge receipt
      return NextResponse.json({ success: true });
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
