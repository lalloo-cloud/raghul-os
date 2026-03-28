import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TZ = "America/Vancouver";
const SPRING_BREAK_END = "2026-03-30";

const DEEP_BLOCKS = [
  { id: "trading", label: "Trading" },
  { id: "physics", label: "Physics" },
  { id: "skill", label: "Skill" },
];

function shiftKey(key, deltaDays) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function prettyDate(key) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${key}T12:00:00Z`));
}

function prettyMonth(key) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  }).format(new Date(`${key}T12:00:00Z`));
}

function monthStartKey(key) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(1);
  return d.toISOString().slice(0, 10);
}

// Fixed: properly shift months using offset
function shiftMonths(key, months) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  d.setUTCDate(1);
  return d.toISOString().slice(0, 10);
}

function firstGridKey(monthKey) {
  const d = new Date(`${monthKey}T12:00:00Z`);
  const day = d.getUTCDay();
  const mondayOffset = (day + 6) % 7;
  return shiftKey(monthKey, -mondayOffset);
}

function isSameMonth(dayKey, monthKey) {
  return dayKey.slice(0, 7) === monthKey.slice(0, 7);
}

function isSpringBreak(dayKey) {
  return dayKey <= SPRING_BREAK_END;
}

function countCompleted(blocks = {}) {
  return DEEP_BLOCKS.filter((b) => blocks[b.id]?.done).length;
}

function allDeepDone(blocks = {}) {
  return DEEP_BLOCKS.every((b) => blocks[b.id]?.done);
}

function longestStreakEndingAt(days, dayKey) {
  let streak = 0;
  let k = dayKey;
  while (allDeepDone(days[k]?.blocks)) {
    streak++;
    k = shiftKey(k, -1);
  }
  return streak;
}

function bestStreak(days) {
  const keys = Object.keys(days).filter((k) => allDeepDone(days[k]?.blocks)).sort();
  if (!keys.length) return 0;
  let best = 1, run = 1;
  for (let i = 1; i < keys.length; i++) {
    if (shiftKey(keys[i - 1], 1) === keys[i]) { run++; best = Math.max(best, run); }
    else run = 1;
  }
  return best;
}

export default function MonthOverview({ days = {}, skills = {}, nowKey }) {
  const [offset, setOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(nowKey);

  // Fixed offset navigation
  const navigatedMonthKey = useMemo(() => {
    const base = monthStartKey(nowKey);
    return shiftMonths(base, offset);
  }, [nowKey, offset]);

  const gridStart = useMemo(() => firstGridKey(navigatedMonthKey), [navigatedMonthKey]);

  const calendarDays = useMemo(
    () => Array.from({ length: 42 }, (_, i) => shiftKey(gridStart, i)),
    [gridStart]
  );

  const monthDays = useMemo(
    () => calendarDays.filter((d) => isSameMonth(d, navigatedMonthKey)),
    [calendarDays, navigatedMonthKey]
  );

  const stats = useMemo(() => {
    const monthDayData = monthDays.map((key) => {
      const blocks = days[key]?.blocks || {};
      const completed = countCompleted(blocks);
      return { key, completed, perfect: completed === 3, skill: skills[key] || "Unassigned", blocks };
    });

    const completedBlocks = monthDayData.reduce((sum, d) => sum + d.completed, 0);
    const perfectDays = monthDayData.filter((d) => d.perfect).length;
    const activeDays = monthDayData.filter((d) => d.completed > 0).length;
    const completionRate = Math.round((completedBlocks / (monthDayData.length * 3 || 1)) * 100);

    return { monthDayData, completedBlocks, perfectDays, activeDays, completionRate, bestStreak: bestStreak(days) };
  }, [days, skills, monthDays]);

  const selected = useMemo(() => {
    const blocks = days[selectedDay]?.blocks || {};
    return {
      key: selectedDay,
      blocks,
      completed: countCompleted(blocks),
      perfect: allDeepDone(blocks),
      skill: skills[selectedDay] || "Unassigned",
      streak: longestStreakEndingAt(days, selectedDay),
      mode: isSpringBreak(selectedDay) ? "Spring Break" : "School Day",
      exists: !!days[selectedDay],
    };
  }, [days, skills, selectedDay]);

  return (
    <motion.section
      className="rounded-[24px] border border-[rgba(216,179,106,.18)] bg-[linear-gradient(180deg,rgba(18,18,22,.92),rgba(9,9,11,.84))] p-5 shadow-[0_24px_90px_rgba(0,0,0,.64)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 text-[0.74rem] font-bold uppercase tracking-[0.18em] text-[#d8b36a]">
            Monthly overview
          </div>
          <h2 className="text-[1.2rem] font-bold tracking-[-0.02em] text-[#fff6e6]">
            Command month dashboard
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a9a398]">
            A month-level view for spotting execution patterns, streaks, and clean runs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NavBtn onClick={() => setOffset((v) => v - 1)}>← Prev month</NavBtn>
          <NavBtn onClick={() => { setOffset(0); setSelectedDay(nowKey); }}>Current month</NavBtn>
          <NavBtn onClick={() => setOffset((v) => v + 1)}>Next month →</NavBtn>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Month completion" value={`${stats.completedBlocks}/${monthDays.length * 3}`} mini={`${stats.completionRate}% of deep blocks complete`} />
        <MetricCard label="Perfect days" value={`${stats.perfectDays}/${monthDays.length}`} mini="Days with all 3 non-negotiables complete" />
        <MetricCard label="Active days" value={`${stats.activeDays}/${monthDays.length}`} mini="Days with at least one completed deep block" />
        <MetricCard label="Best streak" value={`${stats.bestStreak} days`} mini="Longest clean run on record" />
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm text-[#a9a398]">
          <span>{prettyMonth(navigatedMonthKey)}</span>
          <span>{stats.completionRate}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#d8b36a] to-[#ffdf9c] shadow-[0_0_18px_rgba(216,179,106,.28)]"
            initial={false}
            animate={{ width: `${stats.completionRate}%` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_.9fr]">
        <div>
          <div className="mb-3 grid grid-cols-7 gap-1 text-[0.7rem] uppercase tracking-[0.16em] text-[#6f6a63]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-1 py-1 text-center">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((dayKey, index) => {
              const dayData = days[dayKey]?.blocks || {};
              const completed = countCompleted(dayData);
              const perfect = completed === 3;
              const isToday = dayKey === nowKey;
              const inMonth = isSameMonth(dayKey, navigatedMonthKey);
              const skill = skills[dayKey] || "";
              const pct = Math.round((completed / 3) * 100);

              return (
                <motion.button
                  key={dayKey}
                  onClick={() => setSelectedDay(dayKey)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.008 }}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  className={[
                    "relative min-h-[90px] rounded-[16px] border p-2.5 text-left transition",
                    inMonth
                      ? "border-white/7 bg-white/[0.03] text-[#f5efe4]"
                      : "border-white/4 bg-white/[0.01] text-white/25 opacity-40",
                    dayKey === selectedDay ? "border-[#d8b36a]/42 shadow-[0_0_22px_rgba(216,179,106,.1)]" : "",
                    isToday ? "ring-1 ring-[#d8b36a]/35" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="text-[0.75rem] font-bold text-[#fff6e6]">
                        {new Date(`${dayKey}T12:00:00Z`).getUTCDate()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isToday && (
                        <span className="rounded-full border border-[#d8b36a]/28 bg-[#d8b36a]/10 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#ffe0a2]">
                          Today
                        </span>
                      )}
                      {perfect && inMonth && (
                        <span className="rounded-full border border-[#7bf0d3]/24 bg-[#7bf0d3]/10 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#d8efe7]">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#7bf0d3] to-[#d8b36a]"
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>

                  <div className="mt-1.5 text-[0.66rem] text-[#a9a398]">{completed}/3</div>

                  {skill && inMonth && (
                    <div className="mt-1 truncate text-[0.66rem] font-semibold text-[#d8b36a]">
                      {skill.split(" ")[0]}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <div className="mb-3">
            <div className="text-[0.74rem] font-bold uppercase tracking-[0.18em] text-[#d8b36a]">
              Selected day
            </div>
            <h3 className="mt-2 text-[1.05rem] font-bold text-[#fff6e6]">
              {prettyDate(selected.key)}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#a9a398]">
              {selected.mode} · {selected.exists ? "Execution logged" : "No data yet"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected.key}
              initial={{ opacity: 0, x: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.22 }}
            >
              <div className="rounded-[18px] border border-[#d8b36a]/20 bg-black/20 p-4">
                <div className="grid gap-2 sm:grid-cols-2 mb-3">
                  <InfoBox title="Completion">{selected.completed} / 3</InfoBox>
                  <InfoBox title="Streak">{selected.streak} days</InfoBox>
                </div>

                <div className="mb-3">
                  <div className="mb-1.5 text-[0.72rem] uppercase tracking-[0.15em] text-[#d8b36a]">Skill</div>
                  <div className="rounded-[14px] border border-white/7 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-[#fff6e6]">
                    {selected.skill}
                  </div>
                </div>

                <div className="space-y-2">
                  {DEEP_BLOCKS.map((block) => {
                    const done = !!selected.blocks?.[block.id]?.done;
                    return (
                      <div
                        key={block.id}
                        className={[
                          "flex items-center justify-between rounded-[14px] border px-3 py-2 text-sm",
                          done
                            ? "border-[#7bf0d3]/20 bg-[#7bf0d3]/8 text-[#d8efe7]"
                            : "border-white/7 bg-black/20 text-[#a9a398]",
                        ].join(" ")}
                      >
                        <span>{block.label}</span>
                        <span className="text-[0.72rem] uppercase tracking-[0.14em]">
                          {done ? "Done" : "Open"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 text-sm leading-6 text-[#6f6a63]">
            Spot weak days, momentum clusters, and how consistently the non-negotiables are being defended.
          </div>
        </aside>
      </div>
    </motion.section>
  );
}

function NavBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-[#f5efe4] transition hover:border-[#d8b36a]/30 hover:bg-[#d8b36a]/10"
    >
      {children}
    </button>
  );
}

function MetricCard({ label, value, mini }) {
  return (
    <div className="min-h-[92px] rounded-[18px] border border-white/6 bg-white/[0.03] p-3">
      <div className="text-[0.72rem] uppercase tracking-[0.16em] text-[#6f6a63]">{label}</div>
      <div className="mt-2 text-[1.05rem] font-bold text-[#fff6e6]">{value}</div>
      <div className="mt-1 text-sm leading-5 text-[#a9a398]">{mini}</div>
    </div>
  );
}

function InfoBox({ title, children }) {
  return (
    <div className="rounded-[14px] border border-white/6 bg-white/[0.03] p-3">
      <div className="mb-1 text-[0.7rem] uppercase tracking-[0.15em] text-[#d8b36a]">{title}</div>
      <div className="text-[0.98rem] font-semibold leading-5 text-[#fff6e7]">{children}</div>
    </div>
  );
}
