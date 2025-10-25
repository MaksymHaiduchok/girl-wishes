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

    // Get user's Sandik coins
    const { data: sandikData, error: sandikError } = await supabaseAdmin
      .from("sandik_coins")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (sandikError && sandikError.code !== "PGRST116") {
      throw sandikError;
    }

    const amount = sandikData?.amount || 0;

    return NextResponse.json({
      success: true,
      amount,
    });
  } catch (error) {
    console.error("Error fetching Sandik coins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, operation = "add" } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { error: "User ID and amount are required" },
        { status: 400 }
      );
    }

    // Get current amount
    const { data: currentData, error: currentError } = await supabaseAdmin
      .from("sandik_coins")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (currentError && currentError.code !== "PGRST116") {
      throw currentError;
    }

    const currentAmount = currentData?.amount || 0;
    const newAmount =
      operation === "add"
        ? currentAmount + amount
        : Math.max(0, currentAmount - amount);

    // Update or create Sandik coins record
    const { error: updateError } = await supabaseAdmin
      .from("sandik_coins")
      .upsert({
        user_id: userId,
        amount: newAmount,
      });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      amount: newAmount,
      operation,
    });
  } catch (error) {
    console.error("Error updating Sandik coins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
