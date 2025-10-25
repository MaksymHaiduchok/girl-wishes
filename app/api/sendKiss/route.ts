import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    let dbSuccess = false;
    let telegramSuccess = false;

    // Save kiss to database
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      try {
        const { error: dbError } = await supabaseAdmin.from("messages").insert([
          {
            message: "💋 Машуля вам надіслала цьом! 💖",
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
          telegramSuccess = true;
          console.log("✅ Telegram kiss sent successfully!");

          // Auto-complete kiss quest ONLY if kiss was actually sent
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
                    questId: "daily-kiss-quest", // Will be updated after running SQL
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
          }

          return NextResponse.json({
            success: true,
            saved_to_db: dbSuccess,
            sent_to_telegram: telegramSuccess,
            message: "Kiss sent successfully",
          });
        } else {
          return NextResponse.json(
            { error: "Failed to send kiss" },
            { status: 500 }
          );
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
      message: "Kiss processed successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
