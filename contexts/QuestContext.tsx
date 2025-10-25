"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface QuestContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <QuestContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  const context = useContext(QuestContext);
  if (context === undefined) {
    throw new Error("useQuest must be used within a QuestProvider");
  }
  return context;
}
