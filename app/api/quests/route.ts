import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all active quests
    const { data: quests, error: questsError } = await supabaseAdmin
      .from("quests")
      .select("*")
      .eq("is_active", true);

    if (questsError) {
      throw questsError;
    }

    // Get user's quest progress
    const { data: userQuests, error: userQuestsError } = await supabaseAdmin
      .from("user_quests")
      .select("*")
      .eq("user_id", userId);

    if (userQuestsError) {
      throw userQuestsError;
    }

    // Merge quests with user progress
    const questsWithProgress =
      quests?.map((quest) => {
        const userQuest = userQuests?.find((uq) => uq.quest_id === quest.id);
        return {
          ...quest,
          is_completed: userQuest?.is_completed || false,
          completed_at: userQuest?.completed_at,
        };
      }) || [];

    return NextResponse.json({
      success: true,
      quests: questsWithProgress,
    });
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
