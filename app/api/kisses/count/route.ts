import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's ID

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    console.log("🔍 Counting kisses for today:", {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    // Count kisses sent today
    const { data: kisses, error } = await supabaseAdmin
      .from("messages")
      .select("id, created_at, message")
      .eq("message", "💋 Машуля вам надіслала цьом! 💖") // Kiss message
      .gte("created_at", startOfDay.toISOString())
      .lt("created_at", endOfDay.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error counting kisses:", error);
      throw error;
    }

    const kissCount = kisses?.length || 0;
    console.log("💋 Found kisses:", kissCount, kisses);

    return NextResponse.json({
      success: true,
      count: kissCount,
      today: today.toISOString().split("T")[0],
      kisses: kisses || [],
    });
  } catch (error) {
    console.error("Error counting kisses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
