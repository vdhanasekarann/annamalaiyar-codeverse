export default function LockedOverlay() {
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
      <div className="text-center">
        <p className="text-sm font-semibold">Limit reached</p>
        <p className="text-xs text-zinc-300 mt-1">
          Upgrade to unlock
        </p>
      </div>
    </div>
  );
}
