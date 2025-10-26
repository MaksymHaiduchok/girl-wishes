"use client";

import { useState, useEffect, useRef } from "react";
import { X, Coins, Trophy, AlertCircle } from "lucide-react";
import { useQuest } from "@/contexts/QuestContext";
import Toast from "./Toast";

interface CasinoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SlotResult {
  reels: number[];
  isWin: boolean;
  winType: string;
  multiplier: number;
}

export default function CasinoModal({ isOpen, onClose }: CasinoModalProps) {
  const { triggerRefresh } = useQuest();
  const [sandikCoins, setSandikCoins] = useState(0);
  const [betAmount, setBetAmount] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SlotResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [balance, setBalance] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    amount?: number;
  } | null>(null);

  const reelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [reelPositions, setReelPositions] = useState([0, 0, 0]);

  // Іконки слотів
  const iconMap = ["🍌", "🍒", "🍊", "🔔", "🍋", "🍇", "💎", "⭐", "🍀"];
  const iconNames = [
    "banana",
    "cherry",
    "orange",
    "bell",
    "lemon",
    "grape",
    "diamond",
    "star",
    "clover",
  ];

  useEffect(() => {
    if (isOpen) {
      fetchSandikCoins();
    }
  }, [isOpen]);

  const fetchSandikCoins = async () => {
    try {
      const response = await fetch("/api/sandik-coins");
      if (response.ok) {
        const data = await response.json();
        setSandikCoins(data.amount || 0);
        setBalance(data.amount || 0);
      }
    } catch (error) {
      console.error("Error fetching Sandik coins:", error);
    }
  };

  const spin = async () => {
    if (isSpinning || balance < betAmount) return;

    setIsSpinning(true);
    setShowResult(false);
    setLastResult(null);

    // Знімаємо ставку
    const newBalance = balance - betAmount;
    setBalance(newBalance);

    // Анімація барабанів
    const spinDuration = 2000;
    const startTime = Date.now();

    const animateReels = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setReelPositions([
        Math.floor(easeOut * 20) % 9,
        Math.floor(easeOut * 25) % 9,
        Math.floor(easeOut * 30) % 9,
      ]);

      if (progress < 1) {
        requestAnimationFrame(animateReels);
      } else {
        // 🎲 Генеруємо випадковий результат
        const finalReels = [
          Math.floor(Math.random() * 9),
          Math.floor(Math.random() * 9),
          Math.floor(Math.random() * 9),
        ];

        setReelPositions(finalReels);
        checkWin(finalReels);
      }
    };

    requestAnimationFrame(animateReels);
  };

  const checkWin = (reels: number[]) => {
    const [r1, r2, r3] = reels;

    console.log(
      "🎰 Checking win for reels:",
      reels,
      "Icons:",
      iconMap[r1],
      iconMap[r2],
      iconMap[r3]
    );

    let isWin = false;
    let winType = "";
    let multiplier = 0;

    // 🎰 Три однакових — рідкісний великий виграш
    if (r1 === r2 && r2 === r3) {
      isWin = true;
      winType = `🎯 Три однакових: ${iconMap[r1]}${iconMap[r1]}${iconMap[r1]}!`;
      multiplier = 10;
    }
    // ✨ Два однакових — середній шанс
    else if (r1 === r2 || r2 === r3 || r1 === r3) {
      isWin = true;
      // Визначаємо які саме іконки збіглися
      if (r1 === r2) {
        winType = `✨ Два однакових: ${iconMap[r1]}${iconMap[r1]}!`;
      } else if (r2 === r3) {
        winType = `✨ Два однакових: ${iconMap[r2]}${iconMap[r2]}!`;
      } else {
        winType = `✨ Два однакових: ${iconMap[r1]}${iconMap[r1]}!`;
      }
      multiplier = 2;
    }

    const winnings = isWin ? betAmount * multiplier : 0;
    const updatedBalance = balance - betAmount + winnings;

    console.log("🎰 Win result:", { isWin, winType, multiplier, winnings });

    // Оновлюємо статистику
    setGamesPlayed((prev) => prev + 1);
    if (isWin) {
      setTotalWins((prev) => prev + winnings);
    } else {
      setTotalLosses((prev) => prev + betAmount);
    }

    setBalance(updatedBalance);
    setLastResult({ reels, isWin, winType, multiplier });
    setShowResult(true);
    setIsSpinning(false);

    updateCoins(updatedBalance);

    // Показуємо тост замість алерту
    setTimeout(() => {
      if (isWin) {
        setToast({
          type: "success",
          title: "🎉 Виграш!",
          message: winType,
          amount: winnings,
        });
      } else {
        setToast({
          type: "error",
          title: "😔 Спробуйте ще раз!",
          message: `Ви програли ${betAmount} Sandik монеток`,
        });
      }
    }, 400);
  };

  const updateCoins = async (newAmount: number) => {
    try {
      const response = await fetch("/api/sandik-coins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: newAmount }),
      });

      if (response.ok) {
        setSandikCoins(newAmount);
        triggerRefresh();
      }
    } catch (error) {
      console.error("Error updating coins:", error);
    }
  };

  const getBetOptions = () => {
    const maxBet = Math.min(balance, 50);
    return [1, 5, 10, 25, maxBet].filter((bet) => bet <= balance && bet > 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 w-full max-w-4xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-center">
          {/* Main Game Area */}
          <div className="w-full max-w-sm lg:max-w-md">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  🎰 Sandik Casino
                </h2>
              </div>
              <p className="text-blue-200 text-sm">
                Ставте монетки та вигравайте більше!
              </p>
            </div>

            {/* Balance */}
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">Баланс:</span>
                </div>
                <span className="text-yellow-400 font-bold text-xl">
                  {balance} Sandik
                </span>
              </div>
            </div>

            {/* Slot Machine */}
            <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-4 mb-6 relative overflow-hidden">
              <div className="flex justify-center space-x-2 mb-4">
                {[0, 1, 2].map((reelIndex) => (
                  <div
                    key={reelIndex}
                    ref={(el) => {
                      reelsRef.current[reelIndex] = el;
                    }}
                    className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl border-2 border-yellow-400 shadow-lg"
                  >
                    {iconMap[reelPositions[reelIndex]]}
                  </div>
                ))}
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400 transform -translate-y-1/2 opacity-50"></div>
            </div>

            {/* Bet Selection */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">
                Ставка: {betAmount} Sandik
              </label>
              <div className="flex flex-wrap gap-2">
                {getBetOptions().map((bet) => (
                  <button
                    key={bet}
                    onClick={() => setBetAmount(bet)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      betAmount === bet
                        ? "bg-yellow-500 text-black"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {bet}
                  </button>
                ))}
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={spin}
              disabled={isSpinning || balance < betAmount}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isSpinning || balance < betAmount
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 transform hover:scale-105"
              }`}
            >
              {isSpinning ? "🎰 Крутиться..." : "🎰 КРУТИТИ!"}
            </button>

            {/* Result Display */}
            {showResult && lastResult && (
              <div className="mt-4 p-4 rounded-lg bg-black/30">
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {lastResult.isWin ? "🎉" : "😔"}
                  </div>
                  <div className="text-white font-semibold mb-1">
                    {lastResult.isWin
                      ? lastResult.winType
                      : "Спробуйте ще раз!"}
                  </div>
                  {lastResult.isWin && (
                    <div className="text-yellow-400 font-bold">
                      +{betAmount * lastResult.multiplier} Sandik монеток!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warning */}
            {balance < betAmount && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <div className="flex items-center space-x-2 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">
                    Недостатньо Sandik монеток для ставки!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Payout Table & Statistics */}
          <div className="hidden lg:flex lg:flex-col lg:justify-center w-72 space-y-4">
            {/* Payout Table */}
            <div className="bg-black/20 rounded-lg p-4">
              <h3 className="text-white font-bold text-center mb-3 flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Таблиця виграшів</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center bg-yellow-500/20 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🎯</span>
                    <span className="text-white font-semibold">
                      Три однакових
                    </span>
                  </div>
                  <span className="text-yellow-400 font-bold">10x ставка</span>
                </div>
                <div className="flex justify-between items-center bg-blue-500/20 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✨</span>
                    <span className="text-white font-semibold">
                      Два однакових
                    </span>
                  </div>
                  <span className="text-blue-400 font-bold">2x ставка</span>
                </div>
                <div className="flex justify-between items-center bg-gray-500/20 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">😔</span>
                    <span className="text-white font-semibold">
                      Немає збігів
                    </span>
                  </div>
                  <span className="text-gray-400 font-bold">Програш</span>
                </div>
              </div>

              {/* Examples */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-blue-200 text-xs text-center mb-2">
                  Приклади:
                </p>
                <div className="space-y-1 text-xs text-blue-300">
                  <div>🍌🍌🍌 = 10x (ставка 5 = виграш 50)</div>
                  <div>🍒🍒⭐ = 2x (ставка 5 = виграш 10)</div>
                  <div>🍊🔔🍋 = програш</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-blue-200 text-xs">
              <p>🎲 Грайте відповідально!</p>
              <p>Максимальна ставка: 50 Sandik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          amount={toast.amount}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
