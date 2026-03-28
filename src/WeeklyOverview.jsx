import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

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

function startOfWeekKey(key) {
  const d = new Date(`${key}T12:00:00Z`);
  const day = d.getUTCDay();
  const mondayOffset = (day + 6) % 7;
  return shiftKey(key, -mondayOffset);
}

function prettyDate(key) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${key}T12:00:00Z`));
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

function currentStreak(days, todayKey) {
  let streak = 0;
  let k = todayKey;
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

export default function WeeklyOverview({ days = {}, skills = {}, nowKey }) {
  const [offset, setOffset] = useState(0);

  const weekStart = useMemo(() => {
    const base = startOfWeekKey(nowKey);
    return shiftKey(base, offset * 7);
  }, [nowKey, offset]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => shiftKey(weekStart, i)),
    [weekStart]
  );

  const weekStats = useMemo(() => {
    const totals = weekDays.map((key) => {
      const blocks = days[key]?.blocks || {};
      const completed = countCompleted(blocks);
      return {
        key,
        completed,
        perfect: completed === 3,
        skill: skills[key] || "Unassigned",
        mode: isSpringBreak(key) ? "Spring Break" : "School Day",
        blocks,
      };
    });

    const completedBlocks = totals.reduce((sum, d) => sum + d.completed, 0);
    const perfectDays = totals.filter((d) => d.perfect).length;

    return {
      totals,
      completedBlocks,
      perfectDays,
      completionRate: Math.round((completedBlocks / 21) * 100),
      currentStreak: currentStreak(days, nowKey),
      bestStreak: bestStreak(days),
    };
  }, [days, skills, weekDays, nowKey]);

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
            Weekly overview
          </div>
          <h2 className="text-[1.2rem] font-bold tracking-[-0.02em] text-[#fff6e6]">
            Command week dashboard
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a9a398]">
            A clean 7-day view of deep-work execution, streak momentum, and rotating skill lock-ins.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NavBtn onClick={() => setOffset((v) => v - 1)}>← Prev week</NavBtn>
          <NavBtn onClick={() => setOffset(0)}>Current week</NavBtn>
          <NavBtn onClick={() => setOffset((v) => v + 1)}>Next week →</NavBtn>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Week completion" value={`${weekStats.completedBlocks}/21`} mini={`${weekStats.completionRate}% of all deep blocks complete`} />
        <MetricCard label="Perfect days" value={`${weekStats.perfectDays}/7`} mini="Days with all 3 non-negotiables complete" />
        <MetricCard label="Current streak" value={`${weekStats.currentStreak} days`} mini="Consecutive full execution days" />
        <MetricCard label="Best streak" value={`${weekStats.bestStreak} days`} mini="Longest clean run on record" />
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm text-[#a9a398]">
          <span>Weekly execution meter</span>
          <span>{weekStats.completionRate}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#d8b36a] to-[#ffdf9c] shadow-[0_0_18px_rgba(216,179,106,.28)]"
            initial={false}
            animate={{ width: `${weekStats.completionRate}%` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-7">
        {weekStats.totals.map((day, index) => {
          const isToday = day.key === nowKey;
          const pct = Math.round((day.completed / 3) * 100);

          return (
            <motion.article
              key={day.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              whileHover={{ y: -2 }}
              className={[
                "rounded-[20px] border p-4 bg-white/[0.03] border-white/7",
                isToday ? "border-[#d8b36a]/40 shadow-[0_0_28px_rgba(216,179,106,.1)]" : "",
              ].join(" ")}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="text-[0.72rem] uppercase tracking-[0.15em] text-[#d8b36a]">
                    {prettyDate(day.key)}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#fff6e6]">{day.mode}</div>
                </div>
                {isToday && (
                  <span className="rounded-full border border-[#d8b36a]/28 bg-[#d8b36a]/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#ffe0a2]">
                    Today
                  </span>
                )}
              </div>

              <div className="mb-3 text-[0.95rem] font-bold text-[#fff6e6]">
                {day.completed}/3 complete
              </div>

              <div className="mb-3 h-2 overflow-hidden rounded-full border border-white/5 bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#7bf0d3] to-[#d8b36a]"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>

              <div className="mb-3 flex gap-2 flex-wrap">
                <span className="rounded-full border border-[#d8b36a]/20 bg-[#d8b36a]/8 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.14em] text-[#ffe0a2] truncate max-w-full">
                  {day.skill}
                </span>
              </div>

              <div className="space-y-2">
                {DEEP_BLOCKS.map((block) => {
                  const done = !!day.blocks?.[block.id]?.done;
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
                        {done ? "✓" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-4 text-sm leading-6 text-[#6f6a63]">
        Weekly view keeps the command center honest: see which days were clean, which slipped, and whether the streak is being defended.
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
