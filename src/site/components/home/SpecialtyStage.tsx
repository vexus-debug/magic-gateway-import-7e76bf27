import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SpecialtyKey } from "./specialtyScene";

const SPECIALTIES: { key: SpecialtyKey; label: string; code: string; line: string; stats: [string, string][] }[] = [
  {
    key: "dental",
    label: "Dental",
    code: "01",
    line: "Tooth-level charting, chair scheduling and treatment plans that follow each patient visit.",
    stats: [["32", "Teeth charted per visit"], ["Chair", "Based scheduling"]],
  },
  {
    key: "eye",
    label: "Eye care",
    code: "02",
    line: "Refraction, prescriptions and optical orders recorded the way optometrists actually work.",
    stats: [["OD / OS", "Per-eye records"], ["Rx", "To optical order"]],
  },
  {
    key: "lab",
    label: "Laboratory",
    code: "03",
    line: "Samples, test templates and results tracked from collection to the patient's result page.",
    stats: [["Sample", "To result tracking"], ["Online", "Result checks"]],
  },
  {
    key: "general",
    label: "General practice",
    code: "04",
    line: "Consultations, vitals, prescriptions and billing for a clinic that sees a bit of everything.",
    stats: [["Vitals", "On every visit"], ["One", "Patient timeline"]],
  },
];

type SceneApi = { setActive: (k: SpecialtyKey) => void; dispose: () => void };

const SpecialtyStage = () => {
  const reduceMotion = !!useReducedMotion();
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const [active, setActive] = useState<SpecialtyKey>("dental");
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const el = mountRef.current;
    if (!el) return;
    import("./specialtyScene")
      .then(({ mountSpecialtyScene }) => {
        if (cancelled) return;
        try {
          apiRef.current = mountSpecialtyScene(el, { reduceMotion });
          setReady(true);
        } catch {
          // WebGL unavailable: the static caption panel still works
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [reduceMotion]);

  useEffect(() => {
    apiRef.current?.setActive(active);
  }, [active, ready]);

  // gentle auto-advance until the visitor picks one
  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = setInterval(() => {
      setActive((cur) => SPECIALTIES[(SPECIALTIES.findIndex((s) => s.key === cur) + 1) % SPECIALTIES.length].key);
    }, 5200);
    return () => clearInterval(id);
  }, [paused, reduceMotion]);

  const current = SPECIALTIES.find((s) => s.key === active)!;

  return (
    <div className="relative mt-16 grid gap-8 lg:grid-cols-12 lg:items-center">
      <div className="relative order-1 aspect-square w-full lg:order-2 lg:col-span-7 lg:aspect-[5/4]">
        <div
          aria-hidden
          className="absolute inset-[12%] rounded-full bg-[hsl(var(--medical-teal))]/10 blur-3xl"
        />
        <div ref={mountRef} className="absolute inset-0" aria-hidden />
        <motion.div
          initial={false}
          animate={{ opacity: ready ? 0 : 1 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.3em] text-white/30"
        >
          Loading model
        </motion.div>
        <div className="pointer-events-none absolute left-0 top-0 font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
          Specimen {current.code} / 04
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
          Drag cursor to inspect
        </div>
      </div>

      <div className="order-2 lg:order-1 lg:col-span-5">
        <div role="tablist" aria-label="Choose a specialty" className="border-t border-white/10">
          {SPECIALTIES.map((s) => {
            const on = s.key === active;
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setPaused(true);
                  setActive(s.key);
                }}
                onMouseEnter={() => {
                  setPaused(true);
                  setActive(s.key);
                }}
                className="group relative flex w-full items-baseline gap-5 border-b border-white/10 py-4 text-left"
              >
                <span className={`font-mono text-xs transition-colors ${on ? "text-[hsl(var(--medical-teal))]" : "text-white/30"}`}>
                  {s.code}
                </span>
                <span className={`text-xl transition-colors md:text-2xl ${on ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
                  {s.label}
                </span>
                {on && (
                  <motion.span
                    layoutId="specialty-bar"
                    className="absolute bottom-[-1px] left-0 h-px w-full bg-[hsl(var(--medical-teal))]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="relative mt-6 min-h-[9rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="max-w-md text-sm leading-relaxed text-white/60">{current.line}</p>
              <dl className="mt-5 flex gap-8">
                {current.stats.map(([v, l]) => (
                  <div key={l}>
                    <dt className="text-lg text-white">{v}</dt>
                    <dd className="text-xs text-white/40">{l}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyStage;
