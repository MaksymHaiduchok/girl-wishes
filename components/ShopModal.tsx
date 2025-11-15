"use client";

import { useState, useEffect } from "react";
import { X, ShoppingBag, Star, Package, MessageCircle } from "lucide-react";
import { useQuest } from "@/contexts/QuestContext";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  item_type: string;
  image_url?: string;
}

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShopModal({ isOpen, onClose }: ShopModalProps) {
  const { refreshTrigger } = useQuest();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sandikCoins, setSandikCoins] = useState(0);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchSandikCoins();
    }
  }, [isOpen, refreshTrigger]);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/shop/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);

        // Auto-complete "First quest" when shop is opened (this is just visiting shop)
        try {
          const questResponse = await fetch("/api/quests/auto-complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questId: "shop-visit-quest", // Will be updated after running SQL
              questType: "shop",
            }),
          });

          if (questResponse.ok) {
            console.log("✅ First quest auto-completed!");
          }
        } catch (questError) {
          console.error("Error auto-completing first quest:", questError);
        }
      }
    } catch (error) {
      console.error("Error fetching shop items:", error);
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

  const purchaseItem = async (itemId: string) => {
    setPurchasing(itemId);
    try {
      const response = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        await fetchSandikCoins();
        alert(
          "Покупка успішна! Максим отримає повідомлення про твій замовлення! 💖"
        );
      } else {
        const error = await response.json();
        console.error("Purchase error:", error);
        alert(
          `Помилка: ${
            error.message || error.error || "Не вдалося купити товар"
          }`
        );
      }
    } catch (error) {
      console.error("Error purchasing item:", error);
      alert("Помилка при покупці товару");
    } finally {
      setPurchasing(null);
    }
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case "virtual":
        return <MessageCircle className="w-6 h-6 text-blue-400" />;
      case "real":
        return <Package className="w-6 h-6 text-green-400" />;
      case "message":
        return <MessageCircle className="w-6 h-6 text-purple-400" />;
      default:
        return <Package className="w-6 h-6 text-gray-400" />;
    }
  };

  const getItemTypeText = (itemType: string) => {
    switch (itemType) {
      case "virtual":
        return "Віртуальний";
      case "real":
        return "Реальний";
      case "message":
        return "Повідомлення";
      default:
        return "Інший";
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
      <div className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-2xl p-6 w-[90vw] h-[80vh] max-w-5xl mx-4 border border-purple-500/30 shadow-2xl flex flex-col">
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
            Sandy Shop
          </h2>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center bg-purple-600/20 rounded-lg px-4 py-2">
              <img src="/sandik.png" alt="Sandik" className="w-5 h-5 mr-2" />
              <span className="text-purple-200 font-semibold">
                {sandikCoins} Sandik
              </span>
            </div>
            <div className="text-purple-200 text-sm">
              Обміняй Sandik на подарунки від Максима! 💖
            </div>
          </div>
        </div>

        {/* Shop Items */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-purple-200">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Магазин порожній</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-purple-800/50 to-pink-900/50 rounded-xl p-4 border border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="text-center">
                    {/* Item Image */}
                    <div className="mb-4">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 mx-auto rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 mx-auto bg-purple-600/30 rounded-lg flex items-center justify-center">
                          {getItemIcon(item.item_type)}
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.name}
                    </h3>
                    <p className="text-purple-200 text-sm mb-3">
                      {item.description}
                    </p>

                    {/* Item Type */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-xs bg-purple-600/30 text-purple-200 px-2 py-1 rounded">
                        {getItemTypeText(item.item_type)}
                      </span>
                    </div>

                    {/* Price and Buy Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-yellow-400">
                        <img
                          src="/sandik.png"
                          alt="Sandik"
                          className="w-4 h-4 mr-1"
                        />
                        <span className="font-semibold">{item.price}</span>
                      </div>
                      <button
                        onClick={() => purchaseItem(item.id)}
                        disabled={
                          sandikCoins < item.price || purchasing === item.id
                        }
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          sandikCoins >= item.price && purchasing !== item.id
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {purchasing === item.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Купую...
                          </div>
                        ) : (
                          "Купити"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-purple-200 text-sm">
            Використовуй Sandik монетки для покупки подарунків! 🎁
          </p>
        </div>
      </div>
    </div>
  );
}
