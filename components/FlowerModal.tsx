"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import "../app/flower-animation.css";

interface FlowerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FlowerModal({ isOpen, onClose }: FlowerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    // Add the not-loaded class initially
    container.classList.add("not-loaded");

    // Remove the not-loaded class after a delay to start animations
    const timer = setTimeout(() => {
      container.classList.remove("not-loaded");
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-pink-900/90 to-purple-900/90 rounded-2xl p-6 w-[90vw] h-[80vh] max-w-3xl mx-4 border border-pink-500/30 shadow-2xl flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Flower Animation Container */}
        <div
          ref={containerRef}
          className="relative flex-1 mb-3 overflow-hidden rounded-xl flower-modal"
          style={{ background: "transparent" }}
        >
          {/* Night background */}
          <div className="night"></div>

          {/* Flowers container */}
          <div className="flowers">
            {/* Flower 1 */}
            <div className="flower flower--1">
              <div className="flower__leafs flower__leafs--1">
                <div className="flower__leaf flower__leaf--1"></div>
                <div className="flower__leaf flower__leaf--2"></div>
                <div className="flower__leaf flower__leaf--3"></div>
                <div className="flower__leaf flower__leaf--4"></div>
                <div className="flower__white-circle"></div>
                <div className="flower__light flower__light--1"></div>
                <div className="flower__light flower__light--2"></div>
                <div className="flower__light flower__light--3"></div>
                <div className="flower__light flower__light--4"></div>
                <div className="flower__light flower__light--5"></div>
                <div className="flower__light flower__light--6"></div>
                <div className="flower__light flower__light--7"></div>
                <div className="flower__light flower__light--8"></div>
              </div>
              <div className="flower__line">
                <div className="flower__line__leaf flower__line__leaf--1"></div>
                <div className="flower__line__leaf flower__line__leaf--2"></div>
                <div className="flower__line__leaf flower__line__leaf--3"></div>
                <div className="flower__line__leaf flower__line__leaf--4"></div>
                <div className="flower__line__leaf flower__line__leaf--5"></div>
                <div className="flower__line__leaf flower__line__leaf--6"></div>
              </div>
            </div>

            {/* Flower 2 */}
            <div className="flower flower--2">
              <div className="flower__leafs flower__leafs--2">
                <div className="flower__leaf flower__leaf--1"></div>
                <div className="flower__leaf flower__leaf--2"></div>
                <div className="flower__leaf flower__leaf--3"></div>
                <div className="flower__leaf flower__leaf--4"></div>
                <div className="flower__white-circle"></div>
                <div className="flower__light flower__light--1"></div>
                <div className="flower__light flower__light--2"></div>
                <div className="flower__light flower__light--3"></div>
                <div className="flower__light flower__light--4"></div>
                <div className="flower__light flower__light--5"></div>
                <div className="flower__light flower__light--6"></div>
                <div className="flower__light flower__light--7"></div>
                <div className="flower__light flower__light--8"></div>
              </div>
              <div className="flower__line">
                <div className="flower__line__leaf flower__line__leaf--1"></div>
                <div className="flower__line__leaf flower__line__leaf--2"></div>
                <div className="flower__line__leaf flower__line__leaf--3"></div>
                <div className="flower__line__leaf flower__line__leaf--4"></div>
              </div>
            </div>

            {/* Flower 3 */}
            <div className="flower flower--3">
              <div className="flower__leafs flower__leafs--3">
                <div className="flower__leaf flower__leaf--1"></div>
                <div className="flower__leaf flower__leaf--2"></div>
                <div className="flower__leaf flower__leaf--3"></div>
                <div className="flower__leaf flower__leaf--4"></div>
                <div className="flower__white-circle"></div>
                <div className="flower__light flower__light--1"></div>
                <div className="flower__light flower__light--2"></div>
                <div className="flower__light flower__light--3"></div>
                <div className="flower__light flower__light--4"></div>
                <div className="flower__light flower__light--5"></div>
                <div className="flower__light flower__light--6"></div>
                <div className="flower__light flower__light--7"></div>
                <div className="flower__light flower__light--8"></div>
              </div>
              <div className="flower__line">
                <div className="flower__line__leaf flower__line__leaf--1"></div>
                <div className="flower__line__leaf flower__line__leaf--2"></div>
                <div className="flower__line__leaf flower__line__leaf--3"></div>
                <div className="flower__line__leaf flower__line__leaf--4"></div>
              </div>
            </div>

            {/* Growing elements */}
            <div
              className="grow-ans"
              style={{ "--d": "1.2s" } as React.CSSProperties}
            >
              <div className="flower__g-long">
                <div className="flower__g-long__top"></div>
                <div className="flower__g-long__bottom"></div>
              </div>
            </div>

            {/* Grass elements */}
            <div className="growing-grass">
              <div className="flower__grass flower__grass--1">
                <div className="flower__grass--top"></div>
                <div className="flower__grass--bottom"></div>
                <div className="flower__grass__leaf flower__grass__leaf--1"></div>
                <div className="flower__grass__leaf flower__grass__leaf--2"></div>
                <div className="flower__grass__leaf flower__grass__leaf--3"></div>
                <div className="flower__grass__leaf flower__grass__leaf--4"></div>
                <div className="flower__grass__leaf flower__grass__leaf--5"></div>
                <div className="flower__grass__leaf flower__grass__leaf--6"></div>
                <div className="flower__grass__leaf flower__grass__leaf--7"></div>
                <div className="flower__grass__leaf flower__grass__leaf--8"></div>
                <div className="flower__grass__overlay"></div>
              </div>
            </div>

            <div className="growing-grass">
              <div className="flower__grass flower__grass--2">
                <div className="flower__grass--top"></div>
                <div className="flower__grass--bottom"></div>
                <div className="flower__grass__leaf flower__grass__leaf--1"></div>
                <div className="flower__grass__leaf flower__grass__leaf--2"></div>
                <div className="flower__grass__leaf flower__grass__leaf--3"></div>
                <div className="flower__grass__leaf flower__grass__leaf--4"></div>
                <div className="flower__grass__leaf flower__grass__leaf--5"></div>
                <div className="flower__grass__leaf flower__grass__leaf--6"></div>
                <div className="flower__grass__leaf flower__grass__leaf--7"></div>
                <div className="flower__grass__leaf flower__grass__leaf--8"></div>
                <div className="flower__grass__overlay"></div>
              </div>
            </div>

            {/* Additional growing elements */}
            <div
              className="grow-ans"
              style={{ "--d": "2.4s" } as React.CSSProperties}
            >
              <div className="flower__g-right flower__g-right--1">
                <div className="leaf"></div>
              </div>
            </div>

            <div
              className="grow-ans"
              style={{ "--d": "2.8s" } as React.CSSProperties}
            >
              <div className="flower__g-right flower__g-right--2">
                <div className="leaf"></div>
              </div>
            </div>

            <div
              className="grow-ans"
              style={{ "--d": "2.8s" } as React.CSSProperties}
            >
              <div className="flower__g-front">
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--1">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--2">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--3">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--4">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--5">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--6">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--7">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--8">
                  <div className="flower__g-front__leaf"></div>
                </div>
                <div className="flower__g-front__line"></div>
              </div>
            </div>

            <div
              className="grow-ans"
              style={{ "--d": "3.2s" } as React.CSSProperties}
            >
              <div className="flower__g-fr">
                <div className="leaf"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--1"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--2"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--3"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--4"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--5"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--6"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--7"></div>
                <div className="flower__g-fr__leaf flower__g-fr__leaf--8"></div>
              </div>
            </div>

            {/* Long grass elements */}
            <div className="long-g long-g--0">
              <div
                className="grow-ans"
                style={{ "--d": "3s" } as React.CSSProperties}
              >
                <div className="leaf leaf--0"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "2.2s" } as React.CSSProperties}
              >
                <div className="leaf leaf--1"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.4s" } as React.CSSProperties}
              >
                <div className="leaf leaf--2"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.6s" } as React.CSSProperties}
              >
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--1">
              <div
                className="grow-ans"
                style={{ "--d": "3.6s" } as React.CSSProperties}
              >
                <div className="leaf leaf--0"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.8s" } as React.CSSProperties}
              >
                <div className="leaf leaf--1"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4s" } as React.CSSProperties}
              >
                <div className="leaf leaf--2"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.2s" } as React.CSSProperties}
              >
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--2">
              <div
                className="grow-ans"
                style={{ "--d": "4s" } as React.CSSProperties}
              >
                <div className="leaf leaf--0"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.2s" } as React.CSSProperties}
              >
                <div className="leaf leaf--1"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.4s" } as React.CSSProperties}
              >
                <div className="leaf leaf--2"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.6s" } as React.CSSProperties}
              >
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--3">
              <div
                className="grow-ans"
                style={{ "--d": "4s" } as React.CSSProperties}
              >
                <div className="leaf leaf--0"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.2s" } as React.CSSProperties}
              >
                <div className="leaf leaf--1"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3s" } as React.CSSProperties}
              >
                <div className="leaf leaf--2"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.6s" } as React.CSSProperties}
              >
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--4">
              <div
                className="grow-ans"
                style={{ "--d": "4s" } as React.CSSProperties}
              >
                <div className="leaf leaf--0"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.2s" } as React.CSSProperties}
              >
                <div className="leaf leaf--1"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3s" } as React.CSSProperties}
              >
                <div className="leaf leaf--2"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.6s" } as React.CSSProperties}
              >
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--5">
              <div
                className="grow-ans"
                style={{ "--d": "4s" } as React.CSSProperties}
              >
                <div className="leaf leaf--0"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.2s" } as React.CSSProperties}
              >
                <div className="leaf leaf--1"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3s" } as React.CSSProperties}
              >
                <div className="leaf leaf--2"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.6s" } as React.CSSProperties}
              >
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--6">
              <div
                className="grow-ans"
                style={{ "--d": "4.2s" } as React.CSSProperties}
              >
                <div className="leaf leaf--0"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.4s" } as React.CSSProperties}
              >
                <div className="leaf leaf--1"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.6s" } as React.CSSProperties}
              >
                <div className="leaf leaf--2"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "4.8s" } as React.CSSProperties}
              >
                <div className="leaf leaf--3"></div>
              </div>
            </div>

            <div className="long-g long-g--7">
              <div
                className="grow-ans"
                style={{ "--d": "3s" } as React.CSSProperties}
              >
                <div className="leaf leaf--0"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.2s" } as React.CSSProperties}
              >
                <div className="leaf leaf--1"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.5s" } as React.CSSProperties}
              >
                <div className="leaf leaf--2"></div>
              </div>
              <div
                className="grow-ans"
                style={{ "--d": "3.6s" } as React.CSSProperties}
              >
                <div className="leaf leaf--3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center absolute bottom-3 left-0 right-0">
          <h2 className="text-xl font-bold text-white neon-text">
            Букетик для Маші! 🌸
          </h2>
          <p className="text-green-200 text-sm">
            Квіти ростуть для тебе, Машуля! 💖
          </p>
        </div>
      </div>
    </div>
  );
}
