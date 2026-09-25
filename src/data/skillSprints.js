export const SKILL_SPRINTS = [
  {
    id: "explain-it-simply",
    track: "Learn",
    title: "Explain it simply",
    duration: 7,
    description: "Turn one idea you learned recently into an explanation a beginner could understand.",
    steps: ["Choose one idea worth remembering", "Explain it in three plain sentences", "Name one question you still have"],
  },
  {
    id: "recall-before-review",
    track: "Learn",
    title: "Recall before review",
    duration: 8,
    description: "Strengthen a topic by recalling what you know before looking at your notes.",
    steps: ["Pick a topic from work or study", "Write five things you remember", "Check your notes and add one correction"],
  },
  {
    id: "teach-back",
    track: "Learn",
    title: "Teach it back",
    duration: 6,
    description: "Practice clear thinking by teaching a small concept out loud or in writing.",
    steps: ["Choose a concept you used this week", "Give it a one-line definition", "Add one practical example"],
  },
  {
    id: "tiny-feature",
    track: "Build",
    title: "Scope a tiny feature",
    duration: 10,
    description: "Turn a vague product idea into a small change you could finish in one sitting.",
    gptId: "Full-Stack-App-Builder",
    steps: ["Describe the user problem in one sentence", "Write two acceptance checks", "Name the smallest first implementation"],
  },
  {
    id: "trace-a-flow",
    track: "Build",
    title: "Trace one user flow",
    duration: 8,
    description: "Find one place where a product journey can become clearer or faster.",
    gptId: "Full-Stack-App-Builder",
    steps: ["Choose a flow you used recently", "List its steps from the user's view", "Mark one confusing or repeated step"],
  },
  {
    id: "test-one-assumption",
    track: "Build",
    title: "Test one assumption",
    duration: 9,
    description: "Improve a project by making one assumption measurable and testable.",
    gptId: "AI-ML-Data-Science-Mastermind",
    steps: ["Write down a project assumption", "Decide what evidence would support it", "Choose a low-cost way to gather that evidence"],
  },
  {
    id: "audience-first-brief",
    track: "Create",
    title: "Write an audience-first brief",
    duration: 8,
    description: "Make one useful piece of content easier to plan by starting with its reader.",
    gptId: "Digital-Marketing-Strategy-Coach",
    steps: ["Name the audience and their need", "Write the one idea they should remember", "Choose one helpful next step"],
  },
  {
    id: "stronger-opening",
    track: "Create",
    title: "Find a stronger opening",
    duration: 7,
    description: "Improve a draft by replacing a generic first line with a specific one.",
    gptId: "Smart-Writing-Proofer-Plagiarism",
    steps: ["Pick a draft, post, or email", "Write two different opening lines", "Keep the clearer and more specific version"],
  },
  {
    id: "idea-to-outline",
    track: "Create",
    title: "Turn an idea into an outline",
    duration: 10,
    description: "Give one idea a simple structure before spending time polishing it.",
    gptId: "Smart-Writing-Proofer-Plagiarism",
    steps: ["Write the main point in one sentence", "Add three supporting beats", "Finish with a useful takeaway"],
  },
  {
    id: "focus-block",
    track: "Focus",
    title: "Set up a focus block",
    duration: 5,
    description: "Make your next work session easier to start and easier to finish.",
    steps: ["Choose one task that matters today", "Define what 'done for now' means", "Remove one distraction before you begin"],
  },
  {
    id: "clear-the-queue",
    track: "Focus",
    title: "Clear one small queue",
    duration: 6,
    description: "Reduce mental clutter by making one open loop concrete.",
    steps: ["Write down three things on your mind", "Mark one as next, later, or not needed", "Schedule or complete the next small action"],
  },
  {
    id: "weekly-reset",
    track: "Focus",
    title: "Do a two-minute reset",
    duration: 5,
    description: "Create a calmer handoff between the task you finished and the one ahead.",
    steps: ["Close or save what you were working on", "Capture the next action in one line", "Take a short screen-free pause"],
  },
];

export const SPRINT_TRACKS = ["All", "Learn", "Build", "Create", "Focus"];

export function getDailySprint(date, track = "All") {
  const pool = track === "All" ? SKILL_SPRINTS : SKILL_SPRINTS.filter((sprint) => sprint.track === track);
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return pool[((day % pool.length) + pool.length) % pool.length];
}
