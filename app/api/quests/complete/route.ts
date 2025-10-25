import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { questId, userId } = await request.json();

    if (!questId || !userId) {
      return NextResponse.json(
        { error: "Quest ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get quest details
    const { data: quest, error: questError } = await supabaseAdmin
      .from("quests")
      .select("*")
      .eq("id", questId)
      .single();

    if (questError || !quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Check if quest is already completed
    const { data: existingUserQuest, error: existingError } =
      await supabaseAdmin
        .from("user_quests")
        .select("*")
        .eq("user_id", userId)
        .eq("quest_id", questId)
        .single();

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError;
    }

    if (existingUserQuest?.is_completed) {
      return NextResponse.json(
        { error: "Quest already completed" },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: `Quest completed! You earned ${quest.sandik_reward} Sandik coins!`,
      sandik_earned: quest.sandik_reward,
    });
  } catch (error) {
    console.error("Error completing quest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
