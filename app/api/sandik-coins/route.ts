import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's user ID

    const { data: sandikData, error } = await supabaseAdmin
      .from("sandik_coins")
      .select("amount")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching sandik coins:", error);
      return NextResponse.json(
        { error: "Failed to fetch sandik coins" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      amount: sandikData?.amount || 0,
    });
  } catch (error) {
    console.error("Error in sandik-coins GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();
    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's user ID

    if (typeof amount !== "number" || amount < 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Check if user has sandik coins record
    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from("sandik_coins")
      .select("amount")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      // No record exists, create one
      const { error: insertError } = await supabaseAdmin
        .from("sandik_coins")
        .insert({
          user_id: userId,
          amount: amount,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating sandik coins record:", insertError);
        return NextResponse.json(
          { error: "Failed to create sandik coins record" },
          { status: 500 }
        );
      }
    } else if (fetchError) {
      console.error("Error fetching sandik coins:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch sandik coins" },
        { status: 500 }
      );
    } else {
      // Record exists, update it
      const { error: updateError } = await supabaseAdmin
        .from("sandik_coins")
        .update({
          amount: amount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating sandik coins:", updateError);
        return NextResponse.json(
          { error: "Failed to update sandik coins" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      amount: amount,
      message: "Sandik coins updated successfully",
    });
  } catch (error) {
    console.error("Error in sandik-coins POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
