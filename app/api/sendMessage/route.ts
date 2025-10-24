import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let dbSuccess = false;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      try {
        const { error: dbError } = await supabaseAdmin.from("messages").insert([
          {
            message: message,
            created_at: new Date().toISOString(),
          },
        ]);

        if (!dbError) {
          dbSuccess = true;
        }
      } catch (dbError) {
        // Silent error handling
      }
    }

    if (dbSuccess) {
      return NextResponse.json({
        success: true,
        saved_to_db: true,
        message: "Message saved successfully",
      });
    } else {
      return NextResponse.json({
        success: true,
        saved_to_db: false,
        message: "Message processed",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
