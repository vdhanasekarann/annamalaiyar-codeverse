export default function UsageBadge({ used, limit }) {
  return (
    <div className="text-xs text-zinc-300">
      {used} / {limit} used today
    </div>
  );
}
