import type { ReactNode } from "react";
import { create } from "zustand";

export type ToastVariant = "default" | "danger" | "shadow" | "gold";

export interface Toast {
  id: number;
  label?: string;
  message: ReactNode;
  variant: ToastVariant;
  duration: number;
  /** Read out by the polite live region. Off for chatter such as "+1". */
  announce: boolean;
}

export type BannerKind = "gold";

export interface Banner {
  id: number;
  kind: BannerKind;
  text: string;
}

interface FxState {
  toasts: Toast[];
  banner: Banner | null;
  toast: (t: Partial<Omit<Toast, "id">> & { message: ReactNode }) => void;
  dismiss: (id: number) => void;
  showBanner: (kind: BannerKind, text: string) => void;
  clearBanner: (id: number) => void;
}

const MAX_TOASTS = 3;
let nextId = 1;

/** Ephemeral System feedback. Never persisted. */
export const useFx = create<FxState>()((set) => ({
  toasts: [],
  banner: null,
  toast: (t) => {
    const next: Toast = {
      variant: "default",
      duration: 2800,
      announce: true,
      ...t,
      id: nextId++,
    };
    set((s) => ({ toasts: [...s.toasts, next].slice(-MAX_TOASTS) }));
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  showBanner: (kind, text) => set({ banner: { id: nextId++, kind, text } }),
  clearBanner: (id) =>
    set((s) => (s.banner?.id === id ? { banner: null } : s)),
}));

export const toast = (t: Parameters<FxState["toast"]>[0]) =>
  useFx.getState().toast(t);
export const showBanner = (kind: BannerKind, text: string) =>
  useFx.getState().showBanner(kind, text);
