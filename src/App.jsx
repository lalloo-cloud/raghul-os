import React, { useEffect, useMemo, useState } from "react";
import Dashboard from "./Dashboard";

const STORAGE_KEY = "raghul-command-center-react";
const TZ = "America/Vancouver";

function getPTParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const out = {};
  for (const p of parts) if (p.type !== "literal") out[p.type] = p.value;
  return out;
}

function getNowPT() {
  const p = getPTParts();
  return { key: `${p.year}-${p.month}-${p.day}` };
}

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { days: {}, skills: {} };
    } catch {
      return { days: {}, skills: {} };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function handleToggleCheck(block) {
    setState((prev) => {
      const next = structuredClone(prev);
      const todayKey = getNowPT().key;
      if (!next.days[todayKey]) next.days[todayKey] = { blocks: {} };
      if (next.days[todayKey].blocks[block.id]) {
        delete next.days[todayKey].blocks[block.id];
      } else {
        next.days[todayKey].blocks[block.id] = {
          done: true,
          at: new Date().toISOString(),
          title: block.title,
        };
      }
      return next;
    });
  }

  function handleSelectTomorrowSkill(tomorrowKey, skill) {
    setState((prev) => ({
      ...prev,
      skills: { ...prev.skills, [tomorrowKey]: skill },
    }));
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raghul-command-center-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleReset() {
    if (confirm("Reset all streaks, check-ins, and skill selections?")) {
      localStorage.removeItem(STORAGE_KEY);
      setState({ days: {}, skills: {} });
    }
  }

  return (
    <Dashboard
      days={state.days}
      skills={state.skills}
      onToggleCheck={handleToggleCheck}
      onSelectTomorrowSkill={handleSelectTomorrowSkill}
      onExport={handleExport}
      onReset={handleReset}
    />
  );
}
