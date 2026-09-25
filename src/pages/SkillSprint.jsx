import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Clock3, Flame, RotateCcw, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDailySprint, SPRINT_TRACKS } from "../data/skillSprints";

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function storageKey(email) {
  return `cv_skill_sprint_v1:${String(email || "guest").toLowerCase()}`;
}

function readProgress(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    return {
      checklists: saved.checklists && typeof saved.checklists === "object" ? saved.checklists : {},
      answers: saved.answers && typeof saved.answers === "object" ? saved.answers : {},
      completedSprints: Array.isArray(saved.completedSprints) ? saved.completedSprints : [],
    };
  } catch {
    return { checklists: {}, answers: {}, completedSprints: [] };
  }
}

function getCurrentStreak(completedDates, today) {
  const completed = new Set(completedDates);
  const cursor = new Date(today);
  if (!completed.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (completed.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const TRACK_ICONS = {
  Learn: BookOpen,
  Build: Target,
  Create: Sparkles,
  Focus: Zap,
};

export default function SkillSprint() {
  const { user } = useAuth();
  return <SkillSprintWorkspace key={user?.email || "guest"} email={user?.email} />;
}

function SkillSprintWorkspace({ email }) {
  const today = new Date();
  const todayKey = dateKey(today);
  const key = storageKey(email);
  const [track, setTrack] = useState("All");
  const [progress, setProgress] = useState(() => readProgress(key));
  const sprint = getDailySprint(today, track);
  const sprintKey = `${todayKey}::${sprint.id}`;
  const checkedSteps = progress.checklists[sprintKey] || [];
  const complete = checkedSteps.length === sprint.steps.length;
  const completedDates = useMemo(
    () => [...new Set(progress.completedSprints.map((item) => item.split("::")[0]))],
    [progress.completedSprints]
  );
  const streak = getCurrentStreak(completedDates, today);
  const TrackIcon = TRACK_ICONS[sprint.track] || Zap;

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(progress));
    } catch {
      // Progress remains available for the current session if storage is unavailable.
    }
  }, [key, progress]);

  function toggleStep(index) {
    setProgress((current) => {
      const nextSteps = new Set(current.checklists[sprintKey] || []);
      if (nextSteps.has(index)) nextSteps.delete(index);
      else nextSteps.add(index);

      const checklists = {
        ...current.checklists,
        [sprintKey]: [...nextSteps].sort((left, right) => left - right),
      };
      const completed = new Set(current.completedSprints);
      if (nextSteps.size === sprint.steps.length) completed.add(sprintKey);
      else completed.delete(sprintKey);

      return { ...current, checklists, completedSprints: [...completed] };
    });
  }

  function updateAnswer(index, value) {
    setProgress((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [sprintKey]: {
          ...(current.answers[sprintKey] || {}),
          [index]: value,
        },
      },
    }));
  }

  function resetSprint() {
    setProgress((current) => {
      const checklists = { ...current.checklists };
      const answers = { ...current.answers };
      delete checklists[sprintKey];
      delete answers[sprintKey];
      return {
        ...current,
        checklists,
        answers,
        completedSprints: current.completedSprints.filter((item) => item !== sprintKey),
      };
    });
  }

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const keyForDate = dateKey(date);
    return {
      key: keyForDate,
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      done: completedDates.includes(keyForDate),
      isToday: keyForDate === todayKey,
    };
  });

  return (
    <main className="mx-auto max-w-5xl space-y-5 pb-8 text-white">
      <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
            <Sparkles className="h-4 w-4" /> Daily Skill Sprint
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Small steps. Real progress.</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">A short, practical activity to learn, build, create, or reset. Your notes and progress stay on this device.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70"><Clock3 className="h-4 w-4 text-yellow-300" /> About {sprint.duration} minutes</div>
      </header>

      <section className="grid gap-5 md:grid-cols-[minmax(0,1fr)_250px]">
        <div className="rounded-2xl border border-white/10 bg-[#10151d]/80 p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1.5 text-xs font-medium text-yellow-100">
              <TrackIcon className="h-4 w-4" /> {sprint.track} track
            </div>
            <span className="text-xs text-white/45">{today.toLocaleDateString(undefined, { month: "long", day: "numeric" })}</span>
          </div>
          <h2 className="text-2xl font-semibold">{sprint.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{sprint.description}</p>

          <div className="mt-6 space-y-3">
            {sprint.steps.map((step, index) => {
              const isChecked = checkedSteps.includes(index);
              return (
                <div key={step} className={`rounded-xl border p-3 transition ${isChecked ? "border-emerald-300/35 bg-emerald-300/[0.06]" : "border-white/10 bg-white/[0.025]"}`}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label={`${isChecked ? "Mark incomplete" : "Mark complete"}: ${step}`}
                      aria-pressed={isChecked}
                      onClick={() => toggleStep(index)}
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${isChecked ? "border-emerald-300 bg-emerald-300 text-[#08120f]" : "border-white/25 text-transparent hover:border-yellow-200"}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-6 ${isChecked ? "text-white/70" : "text-white"}`}>{step}</p>
                      <textarea
                        rows={2}
                        value={progress.answers[sprintKey]?.[index] || ""}
                        onChange={(event) => updateAnswer(index, event.target.value)}
                        aria-label={`Your answer for: ${step}`}
                        placeholder="Write your response here..."
                        className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-300/50"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p aria-live="polite" className={`text-sm ${complete ? "text-emerald-200" : "text-white/50"}`}>
              {complete ? "Sprint complete. Nice work." : `${checkedSteps.length} of ${sprint.steps.length} steps complete`}
            </p>
            {complete ? (
              <button type="button" onClick={resetSprint} className="inline-flex items-center gap-2 text-xs text-white/55 transition hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Reset today</button>
            ) : sprint.gptId ? (
              <Link to={`/gpt/${sprint.gptId}`} className="inline-flex items-center gap-2 text-sm font-medium text-yellow-200 transition hover:text-yellow-100">Open a related GPT <ArrowRight className="h-4 w-4" /></Link>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Your progress</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-300/10 text-orange-200"><Flame className="h-5 w-5" /></span>
              <div><p className="text-2xl font-semibold">{streak} day{streak === 1 ? "" : "s"}</p><p className="text-xs text-white/50">current streak</p></div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/55">Sprints completed</span>
              <span className="font-semibold">{progress.completedSprints.length}</span>
            </div>
            <div className="mt-5">
              <p className="mb-3 text-xs text-white/45">Last seven days</p>
              <div className="flex justify-between gap-1.5">
                {week.map((day) => (
                  <div key={day.key} className="flex flex-1 flex-col items-center gap-1.5" aria-label={`${day.day}: ${day.done ? "complete" : "not complete"}`}>
                    <span className={`h-2 w-full rounded-full ${day.done ? "bg-emerald-300" : day.isToday ? "bg-yellow-300/50" : "bg-white/10"}`} />
                    <span className={`text-[10px] ${day.isToday ? "text-yellow-100" : "text-white/35"}`}>{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45"><Trophy className="h-4 w-4 text-yellow-300" /> Choose your track</p>
            <div className="flex flex-wrap gap-2">
              {SPRINT_TRACKS.map((option) => (
                <button key={option} type="button" aria-pressed={track === option} onClick={() => setTrack(option)} className={`rounded-lg border px-3 py-1.5 text-xs transition ${track === option ? "border-yellow-300/50 bg-yellow-300/10 text-yellow-100" : "border-white/10 text-white/55 hover:border-white/20 hover:text-white"}`}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
