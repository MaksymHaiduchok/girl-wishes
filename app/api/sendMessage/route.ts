import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let dbSuccess = false;
    let telegramSuccess = false;

    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      try {
        const { error: dbError } = await supabaseAdmin.from("messages").insert([
          {
            message: message,
            created_at: new Date().toISOString(),
          },
        ]);

        if (!dbError) {
          dbSuccess = true;
        }
      } catch (dbError) {
        // Silent error handling
      }
    }

    if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
      try {
        console.log("Sending to Telegram...");
        console.log("BOT_TOKEN exists:", !!process.env.BOT_TOKEN);
        console.log("CHAT_ID exists:", !!process.env.CHAT_ID);
        console.log("CHAT_ID value:", process.env.CHAT_ID);

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
              text: `💖 Нове бажання котика:\n\n${message}`,
            }),
            // Додаємо timeout та retry
            signal: AbortSignal.timeout(10000), // 10 секунд timeout
          }
        );

        console.log("Telegram response status:", telegramResponse.status);
        console.log("Telegram response ok:", telegramResponse.ok);

        const telegramData = await telegramResponse.json();
        console.log("Telegram response data:", telegramData);

        if (telegramResponse.ok) {
          telegramSuccess = true;
          console.log("✅ Telegram message sent successfully!");

          // Auto-complete daily message quest ONLY if message was actually sent
          if (telegramSuccess) {
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
                    questId: "1d24d65d-693d-4f86-8ff2-a0f67de58483", // Daily message quest ID
                    questType: "message",
                  }),
                }
              );

              if (questResponse.ok) {
                console.log("✅ Daily message quest auto-completed!");
              }
            } catch (questError) {
              console.error(
                "Error auto-completing daily message quest:",
                questError
              );
            }
          }
        } else {
          console.log("❌ Telegram error:", telegramData);
        }
      } catch (telegramError) {
        console.log("❌ Telegram network error:", telegramError);
      }
    } else {
      console.log("❌ Telegram not configured - missing BOT_TOKEN or CHAT_ID");
    }

    return NextResponse.json({
      success: true,
      saved_to_db: dbSuccess,
      sent_to_telegram: telegramSuccess,
      message: "Message processed successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
