import { useEffect, useRef } from "react";
import { subscribe, clamp, prefersReduced } from "@/lib/motion";

/**
 * Writes a spring-eased vertical translate on the element. `compute` receives the
 * element's 0..1 progress through the viewport and returns the target offset.
 */
export default function useSpringTransform(
  ref,
  compute,
  { stiffness = 0.085, damping = 0.8 } = {},
) {
  const fnRef = useRef(compute);
  fnRef.current = compute;
  const state = useRef({ x: 0, v: 0 });

  useEffect(() => {
    if (prefersReduced()) return undefined;
    return subscribe(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < -600 || rect.top > vh + 600) return;
      const p = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const target = fnRef.current(p, rect) || 0;
      const s = state.current;
      s.v += (target - s.x) * stiffness;
      s.v *= damping;
      s.x += s.v;
      if (Math.abs(target - s.x) < 0.04 && Math.abs(s.v) < 0.04) {
        s.x = target;
        s.v = 0;
      }
      el.style.transform = `translate3d(0, ${s.x.toFixed(2)}px, 0)`;
    });
  }, [ref, stiffness, damping]);
}