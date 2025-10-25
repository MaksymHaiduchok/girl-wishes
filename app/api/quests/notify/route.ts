import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { questId, questTitle, questType } = await request.json();

    if (!questId || !questTitle || !questType) {
      return NextResponse.json(
        { error: "Quest ID, title and type are required" },
        { status: 400 }
      );
    }

    // Send notification to Telegram
    if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
      try {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            body: JSON.stringify({
              chat_id: process.env.CHAT_ID,
              text: `🎯 Маша виконує квест!\n\n📋 Квест: "${questTitle}"\n📝 Тип: ${questType}\n\n${
                questType === "kiss_circle"
                  ? "💋⭕ Перевір, чи вона надіслала поцілунок в кружечку!"
                  : "Перевір, чи вона це зробила, та підтверди в базі даних."
              }`,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "✅ Підтвердити виконання",
                      callback_data: `verify_quest_${questId}`,
                    },
                    {
                      text: "❌ Не виконано",
                      callback_data: `reject_quest_${questId}`,
                    },
                  ],
                ],
              },
            }),
            signal: AbortSignal.timeout(10000),
          }
        );

        if (telegramResponse.ok) {
          return NextResponse.json({
            success: true,
            message: "Quest notification sent to Telegram",
          });
        } else {
          return NextResponse.json(
            { error: "Failed to send Telegram notification" },
            { status: 500 }
          );
        }
      } catch (telegramError) {
        console.error("Telegram error:", telegramError);
        return NextResponse.json(
          { error: "Telegram network error" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Telegram not configured" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending quest notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
