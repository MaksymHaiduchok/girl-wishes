"use client";

import { useState, useEffect } from "react";
import { X, Brain, Trophy, CheckCircle, XCircle, Clock } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
  category: string;
}

interface QuizSession {
  id: string;
  user_id: string;
  quiz_date: string;
  questions_answered: number;
  correct_answers: number;
  total_earned: number;
  created_at: string;
  updated_at: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextReset, setNextReset] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
      fetchSession();
      calculateNextReset();
    }
  }, [isOpen]);

  // Таймер для оновлення часу
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Розрахунок часу до наступного скидання
  useEffect(() => {
    if (nextReset) {
      const updateTimer = () => {
        const now = new Date();
        const resetTime = new Date(nextReset);
        const diff = resetTime.getTime() - now.getTime();

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(
            `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          );
        } else {
          setTimeLeft("00:00:00");
          // Коли таймер досягає нуля, оновлюємо дані
          fetchSession();
          calculateNextReset();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [nextReset, currentTime]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/quiz/questions");
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async () => {
    try {
      const response = await fetch("/api/quiz/session");
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  const calculateNextReset = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    setNextReset(nextMidnight.toISOString());
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || submitting) return;

    setSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      const response = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: selectedAnswer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsCorrect(data.isCorrect);
        setEarnedCoins(data.earnedCoins);
        setShowResult(true);

        // Оновлюємо сесію
        await fetchSession();
      } else {
        const errorData = await response.json();
        console.error("Quiz answer error:", errorData);
        alert(`Помилка: ${errorData.error || "Невідома помилка"}`);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setShowResult(false);
    } else {
      // Вікторина завершена - оновлюємо сесію
      await fetchSession();
      // Не скидаємо currentQuestionIndex, щоб показати екран завершення
      setSelectedAnswer("");
      setShowResult(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-purple-400";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Легко";
      case "medium":
        return "Середньо";
      case "hard":
        return "Складно";
      default:
        return "Загальне";
    }
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-3 sm:p-6 w-full max-w-2xl max-h-[95vh] border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mr-2 sm:mr-3" />
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              Щоденна Вікторина
            </h2>
          </div>

          {/* Session Stats */}
          {session && (
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="flex items-center bg-purple-600/20 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                <Trophy className="w-4 h-4 text-purple-300 mr-1 sm:mr-2" />
                <span className="text-purple-200 text-xs sm:text-sm">
                  {session.correct_answers}/{session.questions_answered}{" "}
                  правильних
                </span>
              </div>
              <div className="flex items-center bg-yellow-600/20 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                <img
                  src="/sandik.png"
                  alt="Sandik"
                  className="w-4 h-4 mr-1 sm:mr-2"
                />
                <span className="text-yellow-200 text-xs sm:text-sm">
                  {session.total_earned} Sandik
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 sm:h-64">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : session && session.questions_answered >= 3 ? (
            <div className="text-center text-purple-200 p-2">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-yellow-400" />
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">
                Вікторина завершена!
              </h3>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                На сьогодні питань більше немає
              </p>

              {/* Таймер до наступного скидання */}
              {nextReset && (
                <div className="bg-purple-800/30 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300 mr-1 sm:mr-2" />
                    <span className="text-purple-300 text-xs sm:text-sm">
                      Наступна вікторина через:
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-white font-mono">
                    {timeLeft}
                  </div>
                </div>
              )}

              <div className="bg-purple-800/30 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300 mr-1 sm:mr-2" />
                  <span className="text-purple-300 text-xs sm:text-sm">
                    Сьогоднішні результати:
                  </span>
                </div>
                <div className="text-base sm:text-lg text-white">
                  {session.correct_answers}/{session.questions_answered}{" "}
                  правильних
                </div>
                <div className="flex items-center justify-center mt-2">
                  <img
                    src="/sandik.png"
                    alt="Sandik"
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                  />
                  <span className="text-yellow-400 font-semibold text-sm sm:text-base">
                    {session.total_earned} Sandik
                  </span>
                </div>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center text-purple-200">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Немає доступних питань</p>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-4 sm:space-y-6 p-2">
              {/* Question Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm space-y-2 sm:space-y-0">
                <span className="text-purple-300 text-xs sm:text-sm">
                  Питання {currentQuestionIndex + 1} з {questions.length}
                </span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-semibold text-xs sm:text-sm ${getDifficultyColor(
                      currentQuestion.difficulty
                    )}`}
                  >
                    {getDifficultyText(currentQuestion.difficulty)}
                  </span>
                  <span className="text-purple-300 text-xs sm:text-sm">•</span>
                  <span className="text-purple-300 text-xs sm:text-sm">
                    {currentQuestion.category}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="bg-purple-800/30 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
                  {currentQuestion.question}
                </h3>

                {/* Answer Options */}
                <div className="space-y-2 sm:space-y-3">
                  {["A", "B", "C", "D"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={showResult || submitting}
                      className={`w-full p-3 sm:p-4 rounded-lg text-left transition-all duration-200 ${
                        selectedAnswer === option
                          ? "bg-purple-600 text-white border-2 border-purple-400"
                          : showResult &&
                            option === currentQuestion.correct_answer
                          ? "bg-green-600 text-white border-2 border-green-400"
                          : showResult &&
                            selectedAnswer === option &&
                            !isCorrect
                          ? "bg-red-600 text-white border-2 border-red-400"
                          : "bg-purple-700/50 text-purple-200 hover:bg-purple-700 border-2 border-transparent"
                      } ${
                        showResult || submitting
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-bold mr-2 sm:mr-3 text-sm sm:text-base">
                          {option}.
                        </span>
                        <span className="text-xs sm:text-sm">
                          {option === "A" && currentQuestion.option_a}
                          {option === "B" && currentQuestion.option_b}
                          {option === "C" && currentQuestion.option_c}
                          {option === "D" && currentQuestion.option_d}
                        </span>
                        {showResult &&
                          option === currentQuestion.correct_answer && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-green-400" />
                          )}
                        {showResult &&
                          selectedAnswer === option &&
                          !isCorrect && (
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-red-400" />
                          )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Display */}
              {showResult && (
                <div className="bg-purple-800/30 rounded-xl p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-400 mr-3" />
                    ) : (
                      <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-400 mr-3" />
                    )}
                    <h3
                      className={`text-lg sm:text-xl font-bold ${
                        isCorrect ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isCorrect ? "Правильно!" : "Неправильно"}
                    </h3>
                  </div>

                  {isCorrect && earnedCoins > 0 && (
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src="/sandik.png"
                        alt="Sandik"
                        className="w-6 h-6 mr-2"
                      />
                      <span className="text-yellow-400 font-semibold text-lg">
                        +{earnedCoins} Sandik
                      </span>
                    </div>
                  )}

                  {currentQuestion.explanation && (
                    <p className="text-purple-200 text-center mb-4 text-sm sm:text-base">
                      {currentQuestion.explanation}
                    </p>
                  )}

                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                  >
                    {currentQuestionIndex < questions.length - 1
                      ? "Наступне питання"
                      : "Завершити вікторину"}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              {!showResult && selectedAnswer && (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {submitting ? "Перевіряємо..." : "Відповісти"}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center text-purple-200">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Завантаження...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 text-center flex-shrink-0">
          <p className="text-purple-200 text-xs sm:text-sm">
            Щоденна вікторина • 3 питання • 10 Sandik за правильну відповідь
          </p>
        </div>
      </div>
    </div>
  );
}
