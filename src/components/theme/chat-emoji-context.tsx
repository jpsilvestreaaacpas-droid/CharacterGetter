"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface RemoteChatEmoji {
  filename: string;
  url: string;
  character: string;
  set: string;
}

export type DecorationSlot =
  | "sidebar_dashboard"
  | "sidebar_character"
  | "sidebar_pull"
  | "sidebar_banner"
  | "sidebar_resources"
  | "sidebar_progression"
  | "sidebar_teams"
  | "sidebar_settings"
  | "sidebar_footer"
  | "header_tab"
  | "dashboard_target"
  | "dashboard_target_ghost"
  | "dashboard_roster"
  | "dashboard_recent";

const STORAGE_KEY = "cg_chat_emoji_v2";
const API_URL = "/api/chat-emojis";

interface ChatEmojiState {
  emojis: RemoteChatEmoji[];
  assignments: Partial<Record<DecorationSlot, RemoteChatEmoji>>;
  status: "idle" | "loading" | "ready" | "error";
  error?: string;
}

interface ChatEmojiContextValue extends ChatEmojiState {
  getSlot: (slot: DecorationSlot) => RemoteChatEmoji | null;
  shuffleAll: () => void;
  shuffleSlot: (slot: DecorationSlot) => void;
  reload: () => void;
}

const ChatEmojiCtx = React.createContext<ChatEmojiContextValue | null>(null);

const ALL_SLOTS: DecorationSlot[] = [
  "sidebar_dashboard",
  "sidebar_character",
  "sidebar_pull",
  "sidebar_banner",
  "sidebar_resources",
  "sidebar_progression",
  "sidebar_teams",
  "sidebar_settings",
  "sidebar_footer",
  "header_tab",
  "dashboard_target",
  "dashboard_target_ghost",
  "dashboard_roster",
  "dashboard_recent",
];

function pickDistinct(emojis: RemoteChatEmoji[], count: number): RemoteChatEmoji[] {
  const shuffled = [...emojis].sort(() => Math.random() - 0.5);
  const picks: RemoteChatEmoji[] = [];
  for (let i = 0; i < count; i++) {
    picks.push(shuffled[i % shuffled.length]);
  }
  return picks;
}

function saveAssignments(assignments: Partial<Record<DecorationSlot, RemoteChatEmoji>>) {
  try {
    const serialisable: Record<string, { filename: string; url: string; character: string; set: string }> = {};
    for (const [slot, emoji] of Object.entries(assignments)) {
      if (emoji) serialisable[slot] = emoji;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable));
  } catch { /* ignore quota errors */ }
}

function loadAssignments(): Partial<Record<DecorationSlot, RemoteChatEmoji>> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<Record<DecorationSlot, RemoteChatEmoji>>;
  } catch {
    return null;
  }
}

export function ChatEmojiProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ChatEmojiState>({
    emojis: [],
    assignments: {},
    status: "idle",
  });

  const fetchEmojis = React.useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const res = await fetch(API_URL, { next: { revalidate: 3600 } } as RequestInit);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { emojis: RemoteChatEmoji[] };
      const emojis = data.emojis ?? [];

      // Try to restore saved assignments; validate filenames still exist
      const saved = loadAssignments();
      const knownFilenames = new Set(emojis.map((e) => e.filename));
      let assignments: Partial<Record<DecorationSlot, RemoteChatEmoji>> = {};

      if (saved) {
        for (const slot of ALL_SLOTS) {
          const saved_emoji = saved[slot];
          if (saved_emoji && knownFilenames.has(saved_emoji.filename)) {
            // Update url in case CDN url changed but filename same
            const fresh = emojis.find((e) => e.filename === saved_emoji.filename);
            assignments[slot] = fresh ?? saved_emoji;
          }
        }
      }

      // Fill any missing slots with fresh random picks
      const missing = ALL_SLOTS.filter((s) => !assignments[s]);
      if (missing.length > 0 && emojis.length > 0) {
        const picks = pickDistinct(emojis, missing.length);
        missing.forEach((slot, idx) => {
          assignments[slot] = picks[idx];
        });
      }

      saveAssignments(assignments);
      setState({ emojis, assignments, status: "ready" });
    } catch (err) {
      console.error("[ChatEmojiProvider]", err);
      setState((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  React.useEffect(() => {
    fetchEmojis();
  }, [fetchEmojis]);

  const getSlot = React.useCallback(
    (slot: DecorationSlot): RemoteChatEmoji | null => {
      return state.assignments[slot] ?? null;
    },
    [state.assignments]
  );

  const shuffleAll = React.useCallback(() => {
    if (state.emojis.length === 0) return;
    const picks = pickDistinct(state.emojis, ALL_SLOTS.length);
    const assignments: Partial<Record<DecorationSlot, RemoteChatEmoji>> = {};
    ALL_SLOTS.forEach((slot, idx) => {
      assignments[slot] = picks[idx];
    });
    saveAssignments(assignments);
    setState((s) => ({ ...s, assignments }));
  }, [state.emojis]);

  const shuffleSlot = React.useCallback(
    (slot: DecorationSlot) => {
      if (state.emojis.length === 0) return;
      const current = state.assignments[slot];
      const pool = current
        ? state.emojis.filter((e) => e.filename !== current.filename)
        : state.emojis;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return;
      const assignments = { ...state.assignments, [slot]: pick };
      saveAssignments(assignments);
      setState((s) => ({ ...s, assignments }));
    },
    [state.emojis, state.assignments]
  );

  return (
    <ChatEmojiCtx.Provider
      value={{ ...state, getSlot, shuffleAll, shuffleSlot, reload: fetchEmojis }}
    >
      {children}
    </ChatEmojiCtx.Provider>
  );
}

export function useChatEmojis() {
  const ctx = React.useContext(ChatEmojiCtx);
  if (!ctx) throw new Error("useChatEmojis must be used inside <ChatEmojiProvider>");
  return ctx;
}

// ─── Presentational component ───────────────────────────────────────────────

interface ChatEmojiImgProps {
  slot?: DecorationSlot;
  emoji?: RemoteChatEmoji | null;
  size?: number; // pixels, default 40
  animate?: boolean;
  className?: string;
  alt?: string;
}

export function ChatEmojiImg({
  slot,
  emoji: directEmoji,
  size = 40,
  animate = false,
  className,
  alt,
}: ChatEmojiImgProps) {
  let contextEmoji: RemoteChatEmoji | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useChatEmojis();
    if (slot) contextEmoji = ctx.getSlot(slot);
  } catch { /* used outside provider */ }

  const emoji = directEmoji ?? contextEmoji;
  if (!emoji) return null;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 select-none pointer-events-none",
        animate && "animate-genshin-float",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emoji.url}
        alt={alt ?? `${emoji.character} chat emoji`}
        title={`${emoji.character} — ${emoji.set}`}
        width={size}
        height={size}
        className="w-full h-full object-contain drop-shadow-md"
        loading="lazy"
        onError={(e) => {
          // Hide broken images gracefully
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}
