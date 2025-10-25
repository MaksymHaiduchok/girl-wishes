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

    // Count messages sent today
    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select("id, created_at")
      .gte("created_at", startOfDay.toISOString())
      .lt("created_at", endOfDay.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const messageCount = messages?.length || 0;

    return NextResponse.json({
      success: true,
      count: messageCount,
      today: today.toISOString().split("T")[0],
      messages: messages || [],
    });
  } catch (error) {
    console.error("Error counting messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
