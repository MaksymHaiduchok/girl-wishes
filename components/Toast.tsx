"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Coins } from "lucide-react";

interface ToastProps {
  type: "success" | "error";
  title: string;
  message: string;
  amount?: number;
  onClose: () => void;
}

export default function Toast({
  type,
  title,
  message,
  amount,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показуємо тост з невеликою затримкою
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Автоматично ховаємо через 1 секунду
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200); // Даємо час для анімації
    }, 1000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-200 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`min-w-80 max-w-md rounded-xl shadow-2xl border-2 backdrop-blur-sm ${
          type === "success"
            ? "bg-gradient-to-r from-green-500/90 to-emerald-600/90 border-green-400"
            : "bg-gradient-to-r from-red-500/90 to-rose-600/90 border-red-400"
        }`}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {type === "success" ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-white font-bold text-lg">{title}</h3>
                {amount && amount > 0 && (
                  <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
                    <Coins className="w-4 h-4 text-yellow-300" />
                    <span className="text-yellow-300 font-bold text-sm">
                      +{amount}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-white/90 text-sm">{message}</p>
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
