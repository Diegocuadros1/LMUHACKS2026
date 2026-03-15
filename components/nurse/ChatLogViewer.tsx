"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/types";

interface ChatLogViewerProps {
  messages: ChatMessage[];
  onFlag?: (messageId: string, flagged: boolean) => void;
}

export function ChatLogViewer({ messages, onFlag }: ChatLogViewerProps) {
  const [flagging, setFlagging] = useState<string | null>(null);

  const handleFlag = async (message: ChatMessage) => {
    setFlagging(message.id);
    try {
      await fetch(`/api/messages/${message.id}/flag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagged: !message.flagged_incorrect }),
      });
      onFlag?.(message.id, !message.flagged_incorrect);
    } catch {
      console.error("Failed to flag message");
    } finally {
      setFlagging(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="border border-[#a0a0a0] bg-white px-6 py-8 text-center text-[#666] text-sm font-sans">
        NO CHAT MESSAGES FOUND IN CURRENT SESSION.
      </div>
    );
  }

  return (
    <div className="space-y-0 border border-[#a0a0a0] bg-[#f9f9f9] p-2 font-sans flex-1 h-full overflow-y-scroll">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex gap-3 p-3 mb-2 border ${
            m.sender === "patient"
              ? "bg-[#e6f2ff] border-[#b3d9ff]"
              : m.sender === "assistant"
                ? "bg-white border-[#cccccc]"
                : m.sender === "nurse"
                  ? "bg-[#e6ffe6] border-[#b3ffb3]"
                  : "bg-[#f0f0f0] border-dashed border-[#cccccc]"
          } ${m.flagged_incorrect ? "border-[#cc0000] border-2 bg-[#fff0f0]" : ""}`}
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 border-b border-[#cccccc] pb-1">
              <span
                className={`text-[11px] font-bold uppercase tracking-wide ${
                  m.sender === "patient"
                    ? "text-[#0033cc]"
                    : m.sender === "assistant"
                      ? "text-[#333333]"
                      : m.sender === "nurse"
                        ? "text-[#006600]"
                        : "text-[#666666]"
                }`}
              >
                USER: {m.sender}
              </span>
              {m.tool_name && (
                <span className="border border-[#800080] bg-[#fae6fa] px-1 text-[10px] font-bold text-[#800080] uppercase">
                  SYS: {m.tool_name}
                </span>
              )}

              {m.flagged_incorrect && (
                <span className="border border-[#cc0000] bg-white px-1 text-[10px] font-bold text-[#cc0000] uppercase">
                  [ ! ] EXCEPTION FLAGGED
                </span>
              )}

              <span className="ml-auto text-[11px] text-[#555]">
                {new Date(m.created_at).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            <p className="text-[13px] text-black whitespace-pre-wrap leading-relaxed">
              {m.content}
            </p>
          </div>

          {/* Brutalist Button for the Assistant */}
          {m.sender === "assistant" && onFlag && (
            <button
              onClick={() => handleFlag(m)}
              disabled={flagging === m.id}
              title={
                m.flagged_incorrect ? "Unflag response" : "Flag as incorrect"
              }
              className="shrink-0 self-start bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-2 py-1 text-[10px] font-bold text-black uppercase active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] disabled:opacity-50 cursor-pointer shadow-none rounded-none transition-none h-fit"
            >
              {flagging === m.id
                ? "PROC..."
                : m.flagged_incorrect
                  ? "UNFLAG"
                  : "FLAG"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
