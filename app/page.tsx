"use client";

import { useState } from "react";
import { Heart, Flower, Gift, ShoppingBag, Trophy, Brain } from "lucide-react";
import LoveModal from "@/components/LoveModal";
import FlowerModal from "@/components/FlowerModal";
import QuestModal from "@/components/QuestModal";
import ShopModal from "@/components/ShopModal";
import CasinoModal from "@/components/CasinoModal";
import QuizModal from "@/components/QuizModal";
import { useQuest } from "@/contexts/QuestContext";

export default function Home() {
  const { triggerRefresh } = useQuest();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoveModal, setShowLoveModal] = useState(false);
  const [modalType, setModalType] = useState<"wish" | "kiss">("wish");
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showCasinoModal, setShowCasinoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        setMessage("");
        setModalType("wish");
        setShowLoveModal(true);
        setTimeout(() => {
          triggerRefresh();
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(
          `Failed to send message: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen background-container relative flex items-start justify-center p-4 pt-16">
      <div className="absolute inset-0 bg-black/20" />

      {/* MARIA WISHLIST заголовок */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-4xl md:text-6xl font-bold text-white neon-text tracking-wider text-center">
          MARIA WISHLIST
        </h1>
      </div>

      <div className="relative z-10 glass-effect form-container rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <svg
              className="w-16 h-16 text-red-500 heart-pulse"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 neon-text">
            Бажання Машулі
          </h1>
          <p className="text-red-200">Напиши Максиму свої бажання</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напиши, що хочеш"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/50 rounded-xl text-white placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 backdrop-blur-sm input-glow"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/25 border border-red-500/30 button-glow"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Відправляю...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Відправити
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Кнопки в правому нижньому куті */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        {/* Кнопка квестів */}
        <button
          onClick={() => setShowQuestModal(true)}
          className="bg-gradient-to-r from-yellow-600 to-orange-800 hover:from-yellow-700 hover:to-orange-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 border border-yellow-500/30 backdrop-blur-sm"
        >
          <Gift className="w-5 h-5" />
          <span>Квести</span>
        </button>

        {/* Кнопка магазину */}
        <button
          onClick={() => setShowShopModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-800 hover:from-purple-700 hover:to-pink-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 border border-purple-500/30 backdrop-blur-sm"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Sandy Shop</span>
        </button>

        {/* Кнопка казино */}
        <button
          onClick={() => setShowCasinoModal(true)}
          className="bg-gradient-to-r from-yellow-600 to-red-800 hover:from-yellow-700 hover:to-red-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 border border-yellow-500/30 backdrop-blur-sm"
        >
          <span>🎰 Казино</span>
        </button>

        {/* Кнопка вікторини */}
        <button
          onClick={() => setShowQuizModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-800 hover:from-purple-700 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 border border-purple-500/30 backdrop-blur-sm"
        >
          <Brain className="w-5 h-5" />
          <span> Вікторина</span>
        </button>
        {/* Кнопка цьомчика */}
        <button
          onClick={async () => {
            try {
              const response = await fetch("/api/sendKiss", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (response.ok) {
                setModalType("kiss");
                setShowLoveModal(true);
                setTimeout(() => {
                  triggerRefresh();
                }, 1000);
              }
            } catch (error) {
              console.error("Error sending kiss:", error);
            }
          }}
          className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 border border-red-500/30 backdrop-blur-sm"
        >
          <Heart className="w-5 h-5" />
          <span>Відправити Максиму цьомчик</span>
        </button>

        {/* Кнопка букетика */}
        <button
          onClick={() => setShowFlowerModal(true)}
          className="bg-gradient-to-r from-pink-600 to-purple-800 hover:from-pink-700 hover:to-purple-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 border border-pink-500/30 backdrop-blur-sm"
        >
          <Flower className="w-5 h-5" />
          <span>Отримати букетик</span>
        </button>
      </div>

      {/* Love Modal */}
      <LoveModal
        isOpen={showLoveModal}
        onClose={() => setShowLoveModal(false)}
        type={modalType}
      />

      {/* Flower Modal */}
      <FlowerModal
        isOpen={showFlowerModal}
        onClose={() => setShowFlowerModal(false)}
      />

      {/* Quest Modal */}
      <QuestModal
        isOpen={showQuestModal}
        onClose={() => setShowQuestModal(false)}
      />

      {/* Shop Modal */}
      <ShopModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
      />

      {/* Casino Modal */}
      <CasinoModal
        isOpen={showCasinoModal}
        onClose={() => setShowCasinoModal(false)}
      />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
      />
    </div>
  );
}
