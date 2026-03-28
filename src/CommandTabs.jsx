import React from "react";
import { motion } from "framer-motion";

export default function CommandTabs({ tabs = [], activeTab, onChange, className = "" }) {
  return (
    <div
      className={[
        "inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-xl",
        className,
      ].join(" ")}
      role="tablist"
      aria-label="Command views"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={[
              "relative min-w-[92px] rounded-full px-4 py-2.5 text-sm font-semibold transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b36a]/50",
              isActive ? "text-[#fff6e6]" : "text-[#a9a398] hover:text-[#f5efe4]",
            ].join(" ")}
          >
            {isActive && (
              <motion.span
                layoutId="command-tabs-active-pill"
                className="absolute inset-0 rounded-full border border-[#d8b36a]/30 bg-[#d8b36a]/12 shadow-[0_0_18px_rgba(216,179,106,.1)]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {tab.icon ? <span className="text-sm">{tab.icon}</span> : null}
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
