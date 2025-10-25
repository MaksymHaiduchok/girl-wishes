import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Fixed user ID for Maria
    const userId = "550e8400-e29b-41d4-a716-446655440000";

    // Get item details
    const { data: item, error: itemError } = await supabaseAdmin
      .from("shop_items")
      .select("*")
      .eq("id", itemId)
      .eq("is_available", true)
      .single();

    if (itemError || !item) {
      console.log(`❌ Item not found: ${itemId}`, itemError);
      return NextResponse.json(
        { error: "Item not found or not available" },
        { status: 404 }
      );
    }

    // Get user's Sandik coins
    const { data: sandikData, error: sandikError } = await supabaseAdmin
      .from("sandik_coins")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (sandikError && sandikError.code !== "PGRST116") {
      console.log(`❌ Error fetching sandik coins:`, sandikError);
      throw sandikError;
    }

    const currentAmount = sandikData?.amount || 0;

    console.log(`💰 Purchase attempt: ${item.name} (${item.price} Sandik)`);
    console.log(`💰 User has: ${currentAmount} Sandik coins`);

    if (currentAmount < item.price) {
      console.log(`❌ Insufficient coins: ${currentAmount} < ${item.price}`);
      return NextResponse.json(
        {
          error: "Insufficient Sandik coins",
          message: `У тебе ${currentAmount} Sandik монеток, а потрібно ${item.price}. Виконай квести щоб отримати більше!`,
        },
        { status: 400 }
      );
    }

    // Deduct coins
    const newAmount = currentAmount - item.price;
    const { error: updateError } = await supabaseAdmin
      .from("sandik_coins")
      .update({ amount: newAmount })
      .eq("user_id", userId);

    if (updateError) {
      console.log(`❌ Error updating sandik coins:`, updateError);
      throw updateError;
    }

    console.log(`✅ Sandik coins updated: ${currentAmount} -> ${newAmount}`);

    // Record purchase
    const { error: purchaseError } = await supabaseAdmin
      .from("user_purchases")
      .insert({
        user_id: userId,
        item_id: itemId,
        sandik_spent: item.price,
        status: "pending",
      });

    if (purchaseError) {
      console.log(`❌ Error recording purchase:`, purchaseError);
      throw purchaseError;
    }

    console.log(`✅ Purchase recorded for item: ${item.name}`);

    // Send notification to Telegram if configured
    if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
      try {
        console.log(
          `📱 Sending Telegram notification for purchase: ${item.name}`
        );
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            body: JSON.stringify({
              chat_id: process.env.CHAT_ID,
              text: `🛍️ Машуля купила в Sandy Shop!\n\n📦 ${item.name}\n💰 Ціна: ${item.price} Sandik\n📝 ${item.description}\n\nМаксим, виконай замовлення! 💖`,
            }),
            signal: AbortSignal.timeout(10000),
          }
        );

        if (telegramResponse.ok) {
          console.log(`✅ Telegram notification sent successfully`);
        } else {
          console.log(
            `❌ Telegram notification failed:`,
            await telegramResponse.text()
          );
        }
      } catch (telegramError) {
        console.error("❌ Error sending Telegram notification:", telegramError);
      }
    } else {
      console.log(`⚠️ Telegram not configured - missing BOT_TOKEN or CHAT_ID`);
    }

    return NextResponse.json({
      success: true,
      message: "Purchase successful!",
      remaining_sandik: newAmount,
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
