import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's ID

    // Get last update timestamp from query params
    const { searchParams } = new URL(request.url);
    const lastCheck = searchParams.get("lastCheck");

    if (!lastCheck) {
      return NextResponse.json({
        success: true,
        hasUpdates: false,
        message: "No lastCheck timestamp provided",
      });
    }

    // Check if there are any quest updates since lastCheck
    const { data: questUpdates, error: questError } = await supabaseAdmin
      .from("user_quests")
      .select("updated_at, is_completed")
      .eq("user_id", userId)
      .gte("updated_at", lastCheck);

    if (questError) {
      console.error("Error checking quest updates:", questError);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
        },
        { status: 500 }
      );
    }

    // Check if there are any sandik coin updates since lastCheck
    const { data: coinUpdates, error: coinError } = await supabaseAdmin
      .from("sandik_coins")
      .select("updated_at, amount")
      .eq("user_id", userId)
      .gte("updated_at", lastCheck);

    if (coinError) {
      console.error("Error checking coin updates:", coinError);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
        },
        { status: 500 }
      );
    }

    const hasUpdates =
      (questUpdates && questUpdates.length > 0) ||
      (coinUpdates && coinUpdates.length > 0);

    return NextResponse.json({
      success: true,
      hasUpdates,
      questUpdates: questUpdates || [],
      coinUpdates: coinUpdates || [],
    });
  } catch (error) {
    console.error("Error in check-updates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
