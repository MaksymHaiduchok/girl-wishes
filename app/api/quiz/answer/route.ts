import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { questionId, userAnswer } = await request.json();

    const userId = "550e8400-e29b-41d4-a716-446655440000"; // Maria's user ID

    // Перевіряємо чи користувач вже відповідав на це питання сьогодні
    const today = new Date().toISOString().split("T")[0];

    const { data: existingAnswer } = await supabaseAdmin
      .from("user_quiz_answers")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .gte("answered_at", `${today}T00:00:00.000Z`)
      .lte("answered_at", `${today}T23:59:59.999Z`)
      .single();

    if (existingAnswer) {
      return NextResponse.json(
        { error: "Already answered this question today" },
        { status: 400 }
      );
    }

    // Отримуємо правильну відповідь
    const { data: question, error: questionError } = await supabaseAdmin
      .from("quiz_questions")
      .select("correct_answer, explanation")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const isCorrect = userAnswer === question.correct_answer;

    // Зберігаємо відповідь користувача
    const { error: answerError } = await supabaseAdmin
      .from("user_quiz_answers")
      .insert({
        user_id: userId,
        question_id: questionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
      });

    if (answerError) {
      console.error("Error saving answer:", answerError);
      return NextResponse.json(
        { error: "Failed to save answer" },
        { status: 500 }
      );
    }

    // Оновлюємо щоденну сесію вікторини
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("daily_quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("quiz_date", today)
      .single();

    if (sessionError && sessionError.code !== "PGRST116") {
      console.error("Error fetching session:", sessionError);
      return NextResponse.json(
        { error: "Failed to fetch session" },
        { status: 500 }
      );
    }

    if (session) {
      // Оновлюємо існуючу сесію
      const newQuestionsAnswered = session.questions_answered + 1;
      const newCorrectAnswers = session.correct_answers + (isCorrect ? 1 : 0);
      const newTotalEarned = session.total_earned + (isCorrect ? 10 : 0);

      const { error: updateError } = await supabaseAdmin
        .from("daily_quiz_sessions")
        .update({
          questions_answered: newQuestionsAnswered,
          correct_answers: newCorrectAnswers,
          total_earned: newTotalEarned,
        })
        .eq("id", session.id);

      if (updateError) {
        console.error("Error updating session:", updateError);
        return NextResponse.json(
          { error: "Failed to update session" },
          { status: 500 }
        );
      }
    } else {
      // Створюємо нову сесію
      const { error: insertError } = await supabaseAdmin
        .from("daily_quiz_sessions")
        .insert({
          user_id: userId,
          quiz_date: today,
          questions_answered: 1,
          correct_answers: isCorrect ? 1 : 0,
          total_earned: isCorrect ? 10 : 0,
        });

      if (insertError) {
        console.error("Error creating session:", insertError);
        return NextResponse.json(
          { error: "Failed to create session" },
          { status: 500 }
        );
      }
    }

    // Додаємо Sandik монетки якщо відповідь правильна
    if (isCorrect) {
      const { data: existingCoins, error: fetchError } = await supabaseAdmin
        .from("sandik_coins")
        .select("amount")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching sandik coins:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch coins" },
          { status: 500 }
        );
      }

      const currentAmount = existingCoins?.amount || 0;
      const newAmount = currentAmount + 10;

      if (existingCoins) {
        // Оновлюємо існуючі монетки
        const { error: updateError } = await supabaseAdmin
          .from("sandik_coins")
          .update({
            amount: newAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating sandik coins:", updateError);
          return NextResponse.json(
            { error: "Failed to update coins" },
            { status: 500 }
          );
        }
      } else {
        // Створюємо новий запис
        const { error: insertError } = await supabaseAdmin
          .from("sandik_coins")
          .insert({
            user_id: userId,
            amount: newAmount,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error inserting sandik coins:", insertError);
          return NextResponse.json(
            { error: "Failed to add coins" },
            { status: 500 }
          );
        }
      }
    }

    // Перевіряємо чи всі 3 питання відповідені для автоматичного виконання квесту
    const { data: updatedSession } = await supabaseAdmin
      .from("daily_quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("quiz_date", today)
      .single();

    if (updatedSession && updatedSession.questions_answered >= 3) {
      // Автоматично виконуємо квест "Відвідати щоденну вікторину"
      const { data: quizQuest } = await supabaseAdmin
        .from("quests")
        .select("id, sandik_reward")
        .eq("quest_type", "quiz")
        .eq("is_daily", true)
        .single();

      if (quizQuest) {
        // Перевіряємо чи квест ще не виконаний
        const { data: existingQuest } = await supabaseAdmin
          .from("user_quests")
          .select("id")
          .eq("user_id", userId)
          .eq("quest_id", quizQuest.id)
          .eq("is_completed", true)
          .gte("completed_at", `${today}T00:00:00.000Z`)
          .lte("completed_at", `${today}T23:59:59.999Z`)
          .single();

        if (!existingQuest) {
          // Виконуємо квест
          const { error: completeError } = await supabaseAdmin
            .from("user_quests")
            .upsert({
              user_id: userId,
              quest_id: quizQuest.id,
              is_completed: true,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (!completeError) {
            // Додаємо монетки за квест
            const { data: currentCoins } = await supabaseAdmin
              .from("sandik_coins")
              .select("amount")
              .eq("user_id", userId)
              .single();

            const questReward = quizQuest.sandik_reward || 15;
            const totalAmount = (currentCoins?.amount || 0) + questReward;

            await supabaseAdmin.from("sandik_coins").upsert({
              user_id: userId,
              amount: totalAmount,
              updated_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    return NextResponse.json({
      isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      earnedCoins: isCorrect ? 10 : 0,
    });
  } catch (error) {
    console.error("Error in quiz answer API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
