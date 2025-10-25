import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get all available shop items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("shop_items")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json({
      success: true,
      items: items || [],
    });
  } catch (error) {
    console.error("Error fetching shop items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
