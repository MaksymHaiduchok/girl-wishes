import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { questId, action } = await request.json();

    if (!questId || !action) {
      return NextResponse.json(
        { error: "Quest ID and action are required" },
        { status: 400 }
      );
    }

    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's ID

    if (action === "verify") {
      // Get quest details
      const { data: quest, error: questError } = await supabaseAdmin
        .from("quests")
        .select("*")
        .eq("id", questId)
        .single();

      if (questError || !quest) {
        return NextResponse.json({ error: "Quest not found" }, { status: 404 });
      }

      // Mark quest as completed
      const { error: completeError } = await supabaseAdmin
        .from("user_quests")
        .upsert({
          user_id: userId,
          quest_id: questId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      if (completeError) {
        throw completeError;
      }

      // Add Sandik coins to user
      const { error: coinsError } = await supabaseAdmin
        .from("sandik_coins")
        .upsert(
          {
            user_id: userId,
            amount: quest.sandik_reward,
          },
          {
            onConflict: "user_id",
            ignoreDuplicates: false,
          }
        );

      if (coinsError) {
        throw coinsError;
      }

      // Send confirmation to Telegram
      if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
        try {
          await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chat_id: process.env.CHAT_ID,
                text: `✅ Квест "${quest.title}" підтверджено!\n\n💰 Маша отримала ${quest.sandik_reward} Sandik монеток!`,
              }),
            }
          );
        } catch (telegramError) {
          console.error("Error sending confirmation:", telegramError);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Quest completed! Maria earned ${quest.sandik_reward} Sandik coins!`,
        sandik_earned: quest.sandik_reward,
      });
    } else if (action === "reject") {
      // Send rejection message to Telegram
      if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
        try {
          await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chat_id: process.env.CHAT_ID,
                text: `❌ Квест не підтверджено. Маша може спробувати ще раз.`,
              }),
            }
          );
        } catch (telegramError) {
          console.error("Error sending rejection:", telegramError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Quest rejected",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error verifying quest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
