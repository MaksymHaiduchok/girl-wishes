import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's user ID

    // Отримуємо 3 випадкові питання
    const { data: questions, error } = await supabaseAdmin
      .from("quiz_questions")
      .select("*")
      .eq("is_active", true)
      .order("id")
      .limit(3);

    if (error) {
      console.error("Error fetching quiz questions:", error);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      questions: questions || [],
    });
  } catch (error) {
    console.error("Error in quiz questions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
