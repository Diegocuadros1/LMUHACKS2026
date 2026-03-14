"use client";

import { useState } from "react";
import type { Alert } from "@/lib/types";

interface AlertFeedProps {
  alerts: Alert[];
  onStatusChange?: (
    alertId: string,
    status: "acknowledged" | "resolved",
  ) => void;
}

// 2000s enterprise web colors for the containers
const severityStyles: Record<string, string> = {
  critical: "border-[#cc0000] bg-[#fff0f0]",
  high: "border-[#ff8c00] bg-[#fff6e6]",
  medium: "border-[#e6c300] bg-[#ffffe6]",
  low: "border-[#3366cc] bg-[#f0f5ff]",
};

const severityBadge: Record<string, string> = {
  critical: "bg-[#cc0000] text-white border-[#990000]",
  high: "bg-[#ff8c00] text-white border-[#cc7000]",
  medium: "bg-[#ffcc00] text-black border-[#cca300]",
  low: "bg-[#3366cc] text-white border-[#24478f]",
};

export function AlertFeed({ alerts, onStatusChange }: AlertFeedProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatus = async (
    alert: Alert,
    status: "acknowledged" | "resolved",
  ) => {
    setUpdating(alert.id);
    try {
      await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onStatusChange?.(alert.id, status);
    } catch {
      console.error("Failed to update alert status");
    } finally {
      setUpdating(null);
    }
  };

  const open = alerts.filter((a) => a.status === "open");
  const rest = alerts.filter((a) => a.status !== "open");

  if (alerts.length === 0) {
    return (
      <div className="border border-[#a0a0a0] bg-[#f9f9f9] px-6 py-8 text-center font-sans text-[#333] shadow-sm">
        <p className="text-sm font-bold text-[#3366cc]">
          System Status: Nominal
        </p>
        <p className="mt-1 text-xs text-[#666]">
          No active alerts recorded at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-[#f4f5f8] p-3 border border-[#b0b0b0] font-sans">
      {[...open, ...rest].map((alert) => (
        <div
          key={alert.id}
          className={`border p-3 space-y-2 shadow-sm ${severityStyles[alert.severity]}`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#cccccc] pb-2">
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 text-[11px] font-bold uppercase border ${severityBadge[alert.severity]}`}
              >
                {alert.severity}
              </span>
              <span className="text-[11px] text-[#555]">
                {new Date(alert.created_at).toLocaleString("en-US")}
              </span>
            </div>

            <span
              className={`border px-2 py-0.5 text-[11px] font-bold text-black ${
                alert.status === "open"
                  ? "border-[#cc0000] bg-white"
                  : alert.status === "acknowledged"
                    ? "border-[#cca300] bg-white"
                    : "border-[#999999] bg-[#e6e6e6]"
              }`}
            >
              {alert.status === "open"
                ? "Pending"
                : alert.status === "acknowledged"
                  ? "Under Review"
                  : "Resolved"}
            </span>
          </div>

          <p className="text-[13px] text-[#222] leading-relaxed pt-1">
            {alert.reason}
          </p>
          <p className="text-[11px] text-[#666]">
            Created by:{" "}
            <span className="font-semibold text-[#333]">
              {alert.created_by}
            </span>
          </p>

          {alert.status === "open" && (
            <div className="flex gap-2 pt-3">
              <button
                onClick={() => handleStatus(alert, "acknowledged")}
                disabled={updating === alert.id}
                className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-3 py-1 text-[11px] font-bold  active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] disabled:opacity-50 text-black cursor-pointer tracking-wide shadow-none rounded-none"
              >
                Acknowledge
              </button>
              <button
                onClick={() => handleStatus(alert, "resolved")}
                disabled={updating === alert.id}
                className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-3 py-1 text-[11px] font-bold  active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] disabled:opacity-50 text-black cursor-pointer tracking-wide shadow-none rounded-none"
              >
                Resolve
              </button>
            </div>
          )}

          {alert.status === "acknowledged" && (
            <div className="pt-3">
              <button
                onClick={() => handleStatus(alert, "resolved")}
                disabled={updating === alert.id}
                className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-3 py-1 text-[11px] font-bold  active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] disabled:opacity-50 text-black cursor-pointer tracking-wide shadow-none rounded-none"
              >
                Mark Resolved
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
