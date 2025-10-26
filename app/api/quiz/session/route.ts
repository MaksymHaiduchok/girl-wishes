import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's user ID
    const today = new Date().toISOString().split("T")[0];

    // Отримуємо поточну сесію вікторини
    const { data: session, error } = await supabaseAdmin
      .from("daily_quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("quiz_date", today)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching quiz session:", error);
      return NextResponse.json(
        { error: "Failed to fetch session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: session || null,
    });
  } catch (error) {
    console.error("Error in quiz session API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
