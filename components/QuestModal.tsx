"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Gift, Star, Clock, CheckCircle } from "lucide-react";
import { useQuest } from "@/contexts/QuestContext";

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  sandik_reward: number;
  is_completed: boolean;
  completed_at?: string;
  requires_verification: boolean;
}

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestModal({ isOpen, onClose }: QuestModalProps) {
  const { refreshTrigger } = useQuest();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sandikCoins, setSandikCoins] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [kissCount, setKissCount] = useState(0);
  const [nextReset, setNextReset] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [lastUpdateCheck, setLastUpdateCheck] = useState<string>(
    new Date().toISOString()
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchQuests();
      fetchSandikCoins();
      fetchMessageCount();
      fetchKissCount();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchQuests();
      fetchSandikCoins();
      fetchMessageCount();
      fetchKissCount();
      checkDailyReset();
    }
  }, [isOpen, refreshTrigger]);

  // Auto-refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      debouncedRefresh();
    }
  }, [refreshTrigger, debouncedRefresh]);

  // Окремий useEffect для таймера
  useEffect(() => {
    if (isOpen) {
      // Оновлюємо час кожну секунду
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000); // Кожну секунду

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Функція для перевірки оновлень
  const checkForUpdates = async () => {
    try {
      const response = await fetch(
        `/api/quests/check-updates?lastCheck=${encodeURIComponent(
          lastUpdateCheck
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.hasUpdates) {
          console.log("🔄 Updates detected, refreshing data...");
          setIsUpdating(true);
          await fetchQuests();
          await fetchSandikCoins();
          setLastUpdateCheck(new Date().toISOString());
          setIsUpdating(false);
        }
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  // Окремий useEffect для перевірки оновлень
  useEffect(() => {
    if (isOpen) {
      // Перевіряємо оновлення кожні 3 секунди
      const updateTimer = setInterval(() => {
        checkForUpdates();
      }, 3000);

      return () => clearInterval(updateTimer);
    }
  }, [isOpen, lastUpdateCheck]);

  // useEffect для автоматичного скидання щоденних квестів
  useEffect(() => {
    if (isOpen && nextReset) {
      const timer = setInterval(() => {
        const now = new Date();
        const resetTime = new Date(nextReset);
        const diff = resetTime.getTime() - now.getTime();

        // Якщо час скидання настав (або минув)
        if (diff <= 0) {
          console.log("🔄 Daily quest reset time reached! Resetting quests...");
          resetDailyQuests();
        }
      }, 1000); // Перевіряємо кожну секунду

      return () => clearInterval(timer);
    }
  }, [isOpen, nextReset]);

  const fetchQuests = async () => {
    try {
      const response = await fetch(`/api/quests`);
      if (response.ok) {
        const data = await response.json();
        setQuests(data.quests || []);
      }
    } catch (error) {
      console.error("Error fetching quests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSandikCoins = async () => {
    try {
      const response = await fetch(`/api/sandik`);
      if (response.ok) {
        const data = await response.json();
        setSandikCoins(data.amount || 0);
      }
    } catch (error) {
      console.error("Error fetching sandik coins:", error);
    }
  };

  const fetchMessageCount = async () => {
    try {
      const response = await fetch(`/api/messages/count`);
      if (response.ok) {
        const data = await response.json();
        setMessageCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching message count:", error);
    }
  };

  const fetchKissCount = async () => {
    try {
      console.log("🔍 Fetching kiss count...");
      const response = await fetch(`/api/kisses/count`);
      if (response.ok) {
        const data = await response.json();
        console.log("💋 Kiss count data:", data);
        setKissCount(data.count || 0);
      } else {
        console.error("❌ Failed to fetch kiss count:", response.status);
      }
    } catch (error) {
      console.error("❌ Error fetching kiss count:", error);
    }
  };

  const checkDailyReset = async () => {
    try {
      console.log("🔄 Checking daily quest reset...");
      const response = await fetch(`/api/quests/reset-daily`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("⏰ Daily reset check:", data);

        if (data.reset) {
          // Якщо квести скинулися, оновлюємо дані
          await fetchQuests();
          await fetchSandikCoins();
          await fetchMessageCount();
          await fetchKissCount();
        }

        if (data.nextReset) {
          setNextReset(data.nextReset);
        } else {
          // Розраховуємо наступну північ в локальній часовій зоні
          const now = new Date();
          const nextMidnight = new Date(now);
          nextMidnight.setDate(nextMidnight.getDate() + 1);
          nextMidnight.setHours(0, 0, 0, 0);
          setNextReset(nextMidnight.toISOString());
        }
      } else {
        // Розраховуємо наступну північ в локальній часовій зоні
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setDate(nextMidnight.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);
        setNextReset(nextMidnight.toISOString());
      }
    } catch (error) {
      // Розраховуємо наступну північ в локальній часовій зоні
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);
      setNextReset(nextMidnight.toISOString());
    }
  };

  const resetDailyQuests = async () => {
    try {
      console.log("🔄 Resetting daily quests...");
      const response = await fetch(`/api/quests/reset-daily`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("⏰ Daily reset result:", data);

        if (data.reset) {
          // Оновлюємо всі дані після скидання
          await fetchQuests();
          await fetchSandikCoins();
          await fetchMessageCount();
          await fetchKissCount();
          console.log("✅ Daily quests reset successfully!");
        }

        if (data.nextReset) {
          setNextReset(data.nextReset);
        } else {
          // Розраховуємо наступну північ в локальній часовій зоні
          const now = new Date();
          const nextMidnight = new Date(now);
          nextMidnight.setDate(nextMidnight.getDate() + 1);
          nextMidnight.setHours(0, 0, 0, 0);
          setNextReset(nextMidnight.toISOString());
        }
      }
    } catch (error) {
      console.error("❌ Error resetting daily quests:", error);
    }
  };

  const completeQuest = async (
    questId: string,
    questType: string,
    questTitle: string,
    requiresVerification: boolean
  ) => {
    try {
      if (requiresVerification) {
        // Send notification to Telegram about quest attempt
        const notifyResponse = await fetch("/api/quests/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questId,
            questTitle,
            questType,
          }),
        });

        if (notifyResponse.ok) {
          // Redirect to Telegram chat
          window.open("https://t.me/maksym_haiduchok", "_blank");

          // Special message for kiss_circle quest
          const specialMessage =
            questType === "kiss_circle"
              ? `Перейди в Telegram чат з Максимом та надішли поцілунок в кружечку! 💋⭕\n\nМаксим отримав повідомлення про твій квест!`
              : `Перейди в Telegram чат з Максимом та виконай квест: "${questTitle}"\n\nМаксим отримав повідомлення про твій квест!`;

          alert(specialMessage);
        } else {
          alert("Помилка відправки повідомлення. Спробуй ще раз.");
        }
      } else {
        // For quests that don't require verification, complete directly
        const response = await fetch("/api/quests/auto-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questId, questType }),
        });

        if (response.ok) {
          alert(`✅ Квест "${questTitle}" виконано! Отримано Sandik монетки!`);
          // Trigger debounced refresh
          debouncedRefresh();
        } else {
          const errorData = await response.json();
          alert(
            `Помилка виконання квесту: ${errorData.error || "Невідома помилка"}`
          );
        }
      }
    } catch (error) {
      console.error("Error completing quest:", error);
      alert("Помилка підключення до сервера.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-yellow-900/90 to-orange-900/90 rounded-2xl p-4 sm:p-6 w-[95vw] sm:w-[90vw] h-[85vh] sm:h-[80vh] max-w-4xl mx-2 sm:mx-4 border border-yellow-500/30 shadow-2xl flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white neon-text">
              Квести для Маші
            </h2>
            {isUpdating && (
              <div className="ml-2 sm:ml-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-yellow-400"></div>
                <span className="ml-1 sm:ml-2 text-yellow-300 text-xs sm:text-sm">
                  Оновлення...
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="flex items-center bg-yellow-600/20 rounded-lg px-3 sm:px-4 py-2">
              <img src="/sandik.png" alt="Sandik" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-yellow-200 font-semibold text-sm sm:text-base">
                {sandikCoins} Sandik
              </span>
            </div>
          </div>

          {/* Daily Reset Timer */}
          {nextReset && (
            <div className="bg-blue-600/20 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
                  <span className="text-blue-200 text-xs sm:text-sm">
                    Щоденні квести оновляться через:
                  </span>
                </div>
                <span className="text-blue-300 font-semibold text-sm sm:text-base">
                  {(() => {
                    const now = currentTime;
                    const resetTime = new Date(nextReset);
                    const diff = resetTime.getTime() - now.getTime();

                    if (diff <= 0) {
                      return "00:00:00";
                    }

                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor(
                      (diff % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    return `${hours.toString().padStart(2, "0")}:${minutes
                      .toString()
                      .padStart(2, "0")}:${seconds
                      .toString()
                      .padStart(2, "0")}`;
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quests List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center text-yellow-200">
              <Gift className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Немає доступних квестів</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`bg-gradient-to-r ${
                    quest.is_completed
                      ? "from-green-800/50 to-green-900/50 border-green-500/30"
                      : "from-yellow-800/50 to-orange-900/50 border-yellow-500/30"
                  } rounded-xl p-3 sm:p-4 border shadow-lg`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-white mr-2 sm:mr-3">
                          {quest.title}
                        </h3>
                        {quest.is_completed && (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-yellow-200 text-xs sm:text-sm mb-3">
                        {quest.description}
                      </p>

                      {/* Progress for serial quests */}
                      {quest.title === "5 бажань за день" &&
                        !quest.is_completed && (
                          <div className="bg-blue-600/20 rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-blue-200">
                                Прогрес сьогодні:
                              </span>
                              <span className="text-blue-300 font-semibold">
                                {messageCount}/5 бажань
                              </span>
                            </div>
                            <div className="w-full bg-blue-900/30 rounded-full h-1.5 sm:h-2 mt-2">
                              <div
                                className="bg-blue-400 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    (messageCount / 5) * 100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                      {/* Progress for serial kiss quest */}
                      {quest.title === "3 поцілунки за день" &&
                        !quest.is_completed && (
                          <div className="bg-pink-600/20 rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-pink-200">
                                Прогрес сьогодні:
                              </span>
                              <span className="text-pink-300 font-semibold">
                                {kissCount}/3 поцілунки
                              </span>
                            </div>
                            <div className="w-full bg-pink-900/30 rounded-full h-1.5 sm:h-2 mt-2">
                              <div
                                className="bg-pink-400 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    (kissCount / 3) * 100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center text-yellow-400">
                          <img
                            src="/sandik.png"
                            alt="Sandik"
                            className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                          />
                          <span className="text-xs sm:text-sm font-semibold">
                            +{quest.sandik_reward} Sandik
                          </span>
                        </div>
                        <div className="flex items-center text-blue-400">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="text-xs sm:text-sm">
                            {quest.quest_type === "daily"
                              ? "Щоденний"
                              : "Одноразовий"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                      {quest.is_completed ? (
                        <div className="text-green-400 text-xs sm:text-sm text-center sm:text-left">
                          Виконано
                          {quest.completed_at && (
                            <div className="text-xs opacity-75">
                              {new Date(
                                quest.completed_at
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            completeQuest(
                              quest.id,
                              quest.quest_type,
                              quest.title,
                              quest.requires_verification
                            )
                          }
                          disabled={
                            (quest.title === "5 бажань за день" &&
                              messageCount < 5) ||
                            (quest.title === "3 поцілунки за день" &&
                              kissCount < 3)
                          }
                          className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform text-xs sm:text-sm ${
                            (quest.title === "5 бажань за день" &&
                              messageCount < 5) ||
                            (quest.title === "3 поцілунки за день" &&
                              kissCount < 3)
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white hover:scale-105 shadow-lg"
                          }`}
                        >
                          {quest.title === "5 бажань за день" &&
                          messageCount < 5
                            ? `Потрібно ${5 - messageCount} ще`
                            : quest.title === "3 поцілунки за день" &&
                              kissCount < 3
                            ? `Потрібно ${3 - kissCount} ще`
                            : quest.requires_verification
                            ? quest.quest_type === "kiss"
                              ? "Надіслати поцілунок 💋"
                              : quest.quest_type === "message"
                              ? "Надіслати бажання 💖"
                              : quest.quest_type === "kiss_circle"
                              ? "Надіслати поцілунок в кружечку 💋⭕"
                              : quest.quest_type === "sexy"
                              ? "Надіслати хтивку 🔥"
                              : quest.quest_type === "daily_story"
                              ? "Розказати про день 📖"
                              : quest.quest_type === "pet_sandy"
                              ? "Почухати Сенді 🐕"
                              : quest.quest_type === "bmw_hate"
                              ? "Сказати що BMW хуйня 🚗"
                              : quest.quest_type === "look_of_the_day"
                              ? "Показати лук оф зе дей 👗"
                              : quest.quest_type === "eat_three_times"
                              ? "Поїсти три рази 🍽️"
                              : "Виконати"
                            : "Виконати ✅"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-yellow-200 text-xs sm:text-sm">
            Виконуй квести та отримуй Sandik монетки! 💰
          </p>
        </div>
      </div>
    </div>
  );
}
