import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Функція для перемішування масиву (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET() {
  try {
    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's user ID
    const today = new Date().toISOString().split("T")[0];

    // Перевіряємо чи є вже сесія з питаннями на сьогодні
    const { data: existingSession } = await supabaseAdmin
      .from("daily_quiz_sessions")
      .select("question_ids")
      .eq("user_id", userId)
      .eq("quiz_date", today)
      .single();

    // Якщо є сесія з питаннями, повертаємо їх
    if (
      existingSession &&
      existingSession.question_ids &&
      existingSession.question_ids.length > 0
    ) {
      const { data: questions, error } = await supabaseAdmin
        .from("quiz_questions")
        .select("*")
        .eq("is_active", true)
        .in("id", existingSession.question_ids)
        .order("id");

      if (error) {
        console.error("Error fetching existing questions:", error);
      } else if (questions && questions.length > 0) {
        return NextResponse.json({
          success: true,
          questions: questions,
        });
      }
    }

    // Отримуємо всі активні питання
    const { data: allQuestions, error: fetchError } = await supabaseAdmin
      .from("quiz_questions")
      .select("id")
      .eq("is_active", true);

    if (fetchError || !allQuestions || allQuestions.length === 0) {
      console.error("Error fetching all questions:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    // Перемішуємо масив питань випадковим чином
    const shuffledQuestions = shuffleArray(allQuestions);

    // Вибираємо перші 3 випадкові питання
    const questionIds = shuffledQuestions
      .slice(0, Math.min(3, shuffledQuestions.length))
      .map((q) => q.id);

    // Отримуємо повну інформацію про вибрані питання
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("quiz_questions")
      .select("*")
      .eq("is_active", true)
      .in("id", questionIds);

    if (questionsError) {
      console.error("Error fetching selected questions:", questionsError);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    // Зберігаємо вибрані питання в сесію (створюємо або оновлюємо)
    const { data: session } = await supabaseAdmin
      .from("daily_quiz_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("quiz_date", today)
      .single();

    if (session) {
      // Оновлюємо існуючу сесію
      await supabaseAdmin
        .from("daily_quiz_sessions")
        .update({ question_ids: questionIds })
        .eq("id", session.id);
    } else {
      // Створюємо нову сесію
      await supabaseAdmin.from("daily_quiz_sessions").insert({
        user_id: userId,
        quiz_date: today,
        question_ids: questionIds,
        questions_answered: 0,
        correct_answers: 0,
        total_earned: 0,
      });
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
