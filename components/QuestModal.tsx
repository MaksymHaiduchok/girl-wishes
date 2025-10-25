"use client";

import { useState, useEffect } from "react";
import { X, Gift, Star, Clock, CheckCircle } from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  sandik_reward: number;
  is_completed: boolean;
  completed_at?: string;
}

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function QuestModal({
  isOpen,
  onClose,
  userId,
}: QuestModalProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sandikCoins, setSandikCoins] = useState(0);

  useEffect(() => {
    if (isOpen && userId) {
      fetchQuests();
      fetchSandikCoins();
    }
  }, [isOpen, userId]);

  const fetchQuests = async () => {
    try {
      const response = await fetch(`/api/quests?userId=${userId}`);
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
      const response = await fetch(`/api/sandik?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSandikCoins(data.amount || 0);
      }
    } catch (error) {
      console.error("Error fetching sandik coins:", error);
    }
  };

  const completeQuest = async (questId: string) => {
    try {
      const response = await fetch("/api/quests/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questId, userId }),
      });

      if (response.ok) {
        await fetchQuests();
        await fetchSandikCoins();
      }
    } catch (error) {
      console.error("Error completing quest:", error);
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
      <div className="relative bg-gradient-to-br from-yellow-900/90 to-orange-900/90 rounded-2xl p-6 w-[90vw] h-[80vh] max-w-4xl mx-4 border border-yellow-500/30 shadow-2xl flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white neon-text mb-4">
            Квести для Маші
          </h2>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center bg-yellow-600/20 rounded-lg px-4 py-2">
              <img src="/sandik.png" alt="Sandik" className="w-5 h-5 mr-2" />
              <span className="text-yellow-200 font-semibold">
                {sandikCoins} Sandik
              </span>
            </div>
          </div>
        </div>

        {/* Quests List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center text-yellow-200">
              <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Немає доступних квестів</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`bg-gradient-to-r ${
                    quest.is_completed
                      ? "from-green-800/50 to-green-900/50 border-green-500/30"
                      : "from-yellow-800/50 to-orange-900/50 border-yellow-500/30"
                  } rounded-xl p-4 border shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-bold text-white mr-3">
                          {quest.title}
                        </h3>
                        {quest.is_completed && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <p className="text-yellow-200 text-sm mb-3">
                        {quest.description}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-yellow-400">
                          <img
                            src="/sandik.png"
                            alt="Sandik"
                            className="w-4 h-4 mr-1"
                          />
                          <span className="text-sm font-semibold">
                            +{quest.sandik_reward} Sandik
                          </span>
                        </div>
                        <div className="flex items-center text-blue-400">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            {quest.quest_type === "daily"
                              ? "Щоденний"
                              : "Одноразовий"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {quest.is_completed ? (
                        <div className="text-green-400 text-sm">
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
                          onClick={() => completeQuest(quest.id)}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          Виконати
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
        <div className="mt-6 text-center">
          <p className="text-yellow-200 text-sm">
            Виконуй квести та отримуй Sandik монетки! 💰
          </p>
        </div>
      </div>
    </div>
  );
}
