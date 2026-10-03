"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trades, type TradeId } from "@/lib/trades";

type RackState = {
  /** Trades the visitor has pulled off the rack, in the order pulled. */
  pulled: TradeId[];
  isPulled: (id: TradeId) => boolean;
  toggle: (id: TradeId) => void;
  pull: (id: TradeId) => void;
  clear: () => void;
};

const RackContext = createContext<RackState | null>(null);
const STORAGE_KEY = "gw:pulled";
const validIds = new Set<string>(trades.map((t) => t.id));

export function RackProvider({ children }: { children: React.ReactNode }) {
  const [pulled, setPulled] = useState<TradeId[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setPulled(parsed.filter((id): id is TradeId => validIds.has(id)));
    } catch {
      // Storage can be blocked; the rack works without it.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pulled));
    } catch {
      // ignore
    }
  }, [pulled]);

  const toggle = useCallback((id: TradeId) => {
    setPulled((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }, []);

  const pull = useCallback((id: TradeId) => {
    setPulled((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const clear = useCallback(() => setPulled([]), []);

  const value = useMemo<RackState>(
    () => ({ pulled, isPulled: (id) => pulled.includes(id), toggle, pull, clear }),
    [pulled, toggle, pull, clear],
  );

  return <RackContext.Provider value={value}>{children}</RackContext.Provider>;
}

export function useRack() {
  const ctx = useContext(RackContext);
  if (!ctx) throw new Error("useRack must be used inside <RackProvider>");
  return ctx;
}
