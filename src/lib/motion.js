export const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function animateFloat(el, intensity = 6) {
  if (!el || prefersReducedMotion) return;

  let frame;
  const move = (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      el.style.transform = `
        rotateX(${y * -intensity}deg)
        rotateY(${x * intensity}deg)
        translateZ(6px)
      `;
    });
  };

  const reset = () => {
    el.style.transform = "rotateX(0) rotateY(0) translateZ(0)";
  };

  el.addEventListener("mousemove", move);
  el.addEventListener("mouseleave", reset);

  return () => {
    el.removeEventListener("mousemove", move);
    el.removeEventListener("mouseleave", reset);
  };
}

export function ripple(e) {
  const el = e.currentTarget;
  const circle = document.createElement("span");
  const d = Math.max(el.clientWidth, el.clientHeight);

  circle.style.width = circle.style.height = d + "px";
  circle.style.left = e.offsetX - d / 2 + "px";
  circle.style.top = e.offsetY - d / 2 + "px";
  circle.className = "ripple";

  el.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
}
