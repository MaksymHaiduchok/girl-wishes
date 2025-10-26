import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    // Перевіряємо чи потрібно скинути щоденні квести
    const lastReset = await getLastResetTime();
    const shouldReset = !lastReset || new Date(lastReset) < today;

    if (shouldReset) {
      console.log("🔄 Resetting daily quests...");
      
      // Скидаємо щоденні квести для всіх користувачів
      const { error: resetError } = await supabaseAdmin
        .from("user_quests")
        .delete()
        .in("quest_id", [
          "1d24d65d-693d-4f86-8ff2-a0f67de58483", // 5 бажань за день
          "0224565d-5440-429b-9eed-21993520014a", // 3 поцілунки за день
          "quest-eat-three-times-id" // Поїсти три рази на день
        ]);

      if (resetError) {
        console.error("❌ Error resetting daily quests:", resetError);
        return NextResponse.json(
          { error: "Failed to reset daily quests" },
          { status: 500 }
        );
      }

      // Оновлюємо час останнього скидання
      await updateLastResetTime(now.toISOString());
      
      console.log("✅ Daily quests reset successfully!");
      
      return NextResponse.json({
        success: true,
        message: "Daily quests reset successfully",
        reset: true,
        nextReset: nextMidnight.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Daily reset timer updated",
      reset: false,
      nextReset: nextMidnight.toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in reset-daily:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getLastResetTime(): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("daily_reset_log")
      .select("last_reset")
      .order("last_reset", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching last reset time:", error);
      return null;
    }

    return data?.last_reset || null;
  } catch (error) {
    console.error("Error in getLastResetTime:", error);
    return null;
  }
}

async function updateLastResetTime(resetTime: string) {
  try {
    const { error } = await supabaseAdmin
      .from("daily_reset_log")
      .insert({
        last_reset: resetTime,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error updating last reset time:", error);
    }
  } catch (error) {
    console.error("Error in updateLastResetTime:", error);
  }
}
