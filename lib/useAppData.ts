'use client';

import { useState, useEffect, useCallback } from 'react';

export type StripeData = {
  mrr: number;
  revenue7d: number;
  revenue30d: number;
  activeCustomers: number;
  transactions: { id: string; amount: number; currency: string; description: string; date: string }[];
  activeSubscriptions: number;
};

export type GhlDeal = {
  id: string;
  name: string;
  status: string;
  value: number;
  stageId: string;
  stageName: string;
  contact: string;
  updatedAt: string;
};

export type GhlData = {
  deals: GhlDeal[];
  activeDeals: GhlDeal[];
  totalPipelineValue: number;
  byStage: Record<string, { stageName: string; deals: GhlDeal[]; total: number }>;
  pipelines: { id: string; name: string; stages: { id: string; name: string }[] }[];
  totalContacts: number;
  appointments: { id: string; title: string; status: string; startTime: string; contact: string }[];
  wonDeals: number;
  lostDeals: number;
};

// Editable value — shows real data but allows manual override
export function useEditableValue<T>(realValue: T | undefined, storageKey: string) {
  const [override, setOverride] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`override_${storageKey}`);
      if (saved) setOverride(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  const setManual = (val: T) => {
    setOverride(val);
    try { localStorage.setItem(`override_${storageKey}`, JSON.stringify(val)); } catch {}
    setIsEditing(false);
  };

  const clearOverride = () => {
    setOverride(null);
    try { localStorage.removeItem(`override_${storageKey}`); } catch {}
  };

  const value = override !== null ? override : realValue;
  const isOverridden = override !== null;

  return { value, isOverridden, isEditing, setIsEditing, setManual, clearOverride };
}

export function useAppData() {
  const [stripe, setStripe] = useState<StripeData | null>(null);
  const [ghl, setGhl] = useState<GhlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stripeRes, ghlRes] = await Promise.all([
        fetch('/api/stripe').then(r => r.json()).catch(() => null),
        fetch('/api/ghl').then(r => r.json()).catch(() => null),
      ]);
      if (stripeRes && !stripeRes.error) setStripe(stripeRes);
      if (ghlRes && !ghlRes.error) setGhl(ghlRes);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stripe, ghl, loading, error, reload: load };
}
