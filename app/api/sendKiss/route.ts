import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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
              text: "💋 Машуля вам надіслала цьом! 💖",
            }),
            signal: AbortSignal.timeout(10000),
          }
        );

        if (telegramResponse.ok) {
          // Auto-complete kiss quest
          try {
            const questResponse = await fetch(
              `${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/api/quests/auto-complete`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  questId: "0224565d-5440-429b-9eed-21993520014a", // Kiss quest ID
                  questType: "kiss",
                }),
              }
            );

            if (questResponse.ok) {
              console.log("✅ Kiss quest auto-completed!");
            }
          } catch (questError) {
            console.error("Error auto-completing kiss quest:", questError);
          }

          return NextResponse.json({
            success: true,
            message: "Kiss sent successfully",
          });
        } else {
          return NextResponse.json(
            { error: "Failed to send kiss" },
            { status: 500 }
          );
        }
      } catch (telegramError) {
        return NextResponse.json({ error: "Network error" }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: "Telegram not configured" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
