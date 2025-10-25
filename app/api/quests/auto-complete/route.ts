import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { questId, questType } = await request.json();

    if (!questId || !questType) {
      return NextResponse.json(
        { error: "Quest ID and type are required" },
        { status: 400 }
      );
    }

    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's ID

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
    const { data: existingCoins, error: fetchError } = await supabaseAdmin
      .from("sandik_coins")
      .select("amount")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // Create new record
      const { error: insertError } = await supabaseAdmin
        .from("sandik_coins")
        .insert({
          user_id: userId,
          amount: quest.sandik_reward,
        });

      if (insertError) {
        throw insertError;
      }
    } else {
      // Update existing record
      const newAmount = (existingCoins?.amount || 0) + quest.sandik_reward;
      const { error: updateError } = await supabaseAdmin
        .from("sandik_coins")
        .update({ amount: newAmount })
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Quest completed! You earned ${quest.sandik_reward} Sandik coins!`,
      sandik_earned: quest.sandik_reward,
    });
  } catch (error) {
    console.error("Error auto-completing quest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
