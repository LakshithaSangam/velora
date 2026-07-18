"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { onMascotMood, type MascotMood } from "@/lib/mascot-bus";
import { useMascotSpecies, type MascotSpecies } from "@/lib/mascot-species";
import { PersianCat, type CatExpression, type CatPose } from "./PersianCat";
import { GoldenRetriever } from "./GoldenRetriever";
import { Hamster } from "./Hamster";
import { Rabbit } from "./Rabbit";
import { Koala } from "./Koala";
import { Panda } from "./Panda";
import { Owl } from "./Owl";

function MascotArt({
  species,
  size,
  pose,
  expression,
}: {
  species: MascotSpecies;
  size: number;
  pose?: CatPose;
  expression: CatExpression;
}) {
  if (species === "dog") return <GoldenRetriever size={size} pose={pose} expression={expression} />;
  if (species === "hamster") return <Hamster size={size} pose={pose} expression={expression} />;
  if (species === "rabbit") return <Rabbit size={size} pose={pose} expression={expression} />;
  if (species === "koala") return <Koala size={size} pose={pose} expression={expression} />;
  if (species === "panda") return <Panda size={size} pose={pose} expression={expression} />;
  if (species === "owl") return <Owl size={size} pose={pose} expression={expression} />;
  return <PersianCat size={size} pose={pose} expression={expression} />;
}

const WALK_RANGE: Record<MascotSpecies, { min: number; span: number }> = {
  cat: { min: 30, span: 40 },
  dog: { min: 35, span: 55 },
  hamster: { min: 18, span: 22 },
  rabbit: { min: 40, span: 50 },
  koala: { min: 8, span: 8 },
  panda: { min: 20, span: 20 },
  owl: { min: 15, span: 20 },
};

const WALK_ANIMATION_CLASS: Record<MascotSpecies, string> = {
  cat: "block animate-[catWalkBob_0.45s_ease-in-out_infinite]",
  dog: "block animate-[dogHop_0.35s_ease-in-out_infinite]",
  hamster: "block animate-[hamsterWaddle_0.28s_ease-in-out_infinite]",
  rabbit: "block animate-[rabbitHop_0.4s_ease-in-out_infinite]",
  koala: "block animate-[koalaShuffle_0.9s_ease-in-out_infinite]",
  panda: "block animate-[pandaAmble_0.6s_ease-in-out_infinite]",
  owl: "block animate-[owlBob_0.5s_ease-in-out_infinite]",
};

// How long a walk lasts, and how long the position slide takes — each
// species gets its own pace: quick bursts for the hamster and rabbit, an
// unhurried amble for the panda, and the koala barely moves at all.
const WALK_DURATION: Record<MascotSpecies, number> = {
  cat: 2200,
  dog: 2200,
  hamster: 1100,
  rabbit: 2000,
  koala: 3000,
  panda: 2600,
  owl: 1800,
};

const WALK_SLIDE_MS: Record<MascotSpecies, number> = {
  cat: 1800,
  dog: 1800,
  hamster: 900,
  rabbit: 1000,
  koala: 2600,
  panda: 2200,
  owl: 1400,
};

const PET_SOUND: Record<MascotSpecies, string> = {
  cat: "purr... purr... purr...",
  dog: "woof woof woof...",
  hamster: "squeak squeak squeak...",
  rabbit: "thump thump thump...",
  koala: "snuggle snuggle snuggle...",
  panda: "baa baa baa...",
  owl: "hoot hoot hoot...",
};

const FEED_SOUND: Record<MascotSpecies, string> = {
  cat: "nom nom nom...",
  dog: "crunch crunch crunch...",
  hamster: "munch munch munch...",
  rabbit: "nibble nibble nibble...",
  koala: "chew chew chew...",
  panda: "crunch crunch crunch...",
  owl: "crunch crunch crunch...",
};

const TREAT_EMOJI: Record<MascotSpecies, string> = {
  cat: "🐟",
  dog: "🦴",
  hamster: "🥜",
  rabbit: "🥕",
  koala: "🌿",
  panda: "🎋",
  owl: "🌰",
};

const MOOD_BADGE: Partial<Record<MascotMood, string>> = {
  thinking: "💭",
  listening: "👂",
  test: "💪",
  surprised: "❗",
};

const SUPPORTIVE_MESSAGES = [
  "You've got this!",
  "Take your time.",
  "Breathe — you know this.",
  "One question at a time.",
  "Almost there!",
];

const POSITION_STORAGE_KEY = "velora-mascot-position";
const DRAG_THRESHOLD_PX = 6;
const CAT_SIZE = 72;
const SLEEP_AFTER_MS = 70_000;
const WALK_CHECK_MS = 25_000;
const WALK_CHANCE = 0.35;

function pathnameMood(pathname: string): MascotMood {
  if (pathname.includes("/take")) return "test";
  if (pathname === "/notes/live") return "listening";
  return "idle";
}

// A static, SSR-safe placeholder — the real (window-dependent) position is
// only computed client-side, inside an effect, after mount. Computing it
// during the initial render would make the server-rendered position (which
// has no window to measure) mismatch the client's, triggering a hydration
// error.
const INITIAL_POSITION = { x: 0, y: 80 };

function defaultPosition() {
  return { x: window.innerWidth - CAT_SIZE - 24, y: 80 };
}

function clampPosition(x: number, y: number) {
  const maxX = window.innerWidth - CAT_SIZE;
  const maxY = window.innerHeight - CAT_SIZE;
  return { x: Math.min(Math.max(x, 0), maxX), y: Math.min(Math.max(y, 0), maxY) };
}

export function MascotCat() {
  const pathname = usePathname();
  const species = useMascotSpecies();
  const [mood, setMood] = useState<MascotMood>(() => pathnameMood(pathname));
  const [fullscreen, setFullscreen] = useState(false);
  const [purring, setPurring] = useState(false);
  const [feeding, setFeeding] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [pose, setPose] = useState<CatPose>("sitting");
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [treatOffset, setTreatOffset] = useState({ x: 0, y: 0 });
  const [draggingTreat, setDraggingTreat] = useState(false);
  const purrTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());
  const poseRef = useRef<CatPose>("sitting");
  const fullscreenCatRef = useRef<HTMLButtonElement>(null);
  const treatRef = useRef<HTMLDivElement>(null);
  const treatDragRef = useRef<{ startX: number; startY: number } | null>(null);
  const dragStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(
    null,
  );

  function registerActivity() {
    lastActivityRef.current = Date.now();
    setPose("sitting");
  }

  useEffect(() => {
    const saved = localStorage.getItem(POSITION_STORAGE_KEY);
    if (saved) {
      try {
        const { x, y } = JSON.parse(saved);
        setPosition(clampPosition(x, y));
        return;
      } catch {
        // fall through to the default position below
      }
    }
    setPosition(defaultPosition());
  }, []);

  useEffect(() => {
    setMood(pathnameMood(pathname));
  }, [pathname]);

  useEffect(() => {
    return onMascotMood((next) => setMood(next === "idle" ? pathnameMood(pathname) : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Any real activity (a test, a live session, notes generating, a sudden
  // error) interrupts a walk/sleep and keeps the cat sitting and awake.
  useEffect(() => {
    if (mood !== "idle") registerActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  // Occasional blink, so it feels alive even while just sitting still.
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 160);
      },
      3000 + Math.random() * 3000,
    );
    return () => clearInterval(blinkInterval);
  }, []);

  // Fall asleep after a while of no interaction on an idle page; any
  // interaction (drag, click, pet, feed, or a mood change) wakes it back up
  // via registerActivity().
  useEffect(() => {
    if (mood !== "idle" || fullscreen) {
      if (pose === "sleeping") setPose("sitting");
      return;
    }
    const check = setInterval(() => {
      if (pose === "sitting" && Date.now() - lastActivityRef.current > SLEEP_AFTER_MS) {
        setPose("sleeping");
      }
    }, 5000);
    return () => clearInterval(check);
  }, [mood, fullscreen, pose]);

  // Every so often, a short, calm, straight-line walk nearby, then back to
  // sitting — repeating for as long as the cat stays idle and awake. This
  // scheduler must NOT depend on `pose`: it sets pose to "walking" itself,
  // and if `pose` were a dependency, that state change would tear down and
  // rebuild this effect immediately, clearing the revert-to-sitting timeout
  // below before it ever fires and leaving the cat stuck mid-walk forever.
  // Reading pose via a ref sidesteps that.
  useEffect(() => {
    poseRef.current = pose;
  }, [pose]);

  useEffect(() => {
    if (mood !== "idle" || fullscreen) return;
    const timer = setInterval(() => {
      if (dragStateRef.current || poseRef.current !== "sitting" || Math.random() >= WALK_CHANCE) return;
      const range = WALK_RANGE[species];
      const dx = (Math.random() < 0.5 ? -1 : 1) * (range.min + Math.random() * range.span);
      setPose("walking");
      setPosition((prev) => clampPosition(prev.x + dx, prev.y));
    }, WALK_CHECK_MS);
    return () => clearInterval(timer);
  }, [mood, fullscreen, species]);

  // Revert from walking back to sitting after a short stroll.
  useEffect(() => {
    if (pose !== "walking") return;
    const timeout = setTimeout(() => setPose("sitting"), WALK_DURATION[species]);
    return () => clearTimeout(timeout);
  }, [pose, species]);

  // Rotate a short, encouraging message near the mascot while a test is in
  // progress.
  useEffect(() => {
    if (mood !== "test") {
      setTestMessage(null);
      return;
    }
    let hideTimeout: ReturnType<typeof setTimeout>;
    function showMessage() {
      setTestMessage(SUPPORTIVE_MESSAGES[Math.floor(Math.random() * SUPPORTIVE_MESSAGES.length)]);
      hideTimeout = setTimeout(() => setTestMessage(null), 4000);
    }
    showMessage();
    const interval = setInterval(showMessage, 14000);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimeout);
    };
  }, [mood]);

  function handlePointerDown(e: React.PointerEvent) {
    registerActivity();
    dragStateRef.current = { startX: e.clientX, startY: e.clientY, originX: position.x, originY: position.y, moved: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const drag = dragStateRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) drag.moved = true;
    if (drag.moved) {
      setPosition(clampPosition(drag.originX + dx, drag.originY + dy));
    }
  }

  function handlePointerUp() {
    const drag = dragStateRef.current;
    if (!drag) return;
    if (drag.moved) {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
    } else {
      setFullscreen(true);
    }
    dragStateRef.current = null;
  }

  function handlePet() {
    registerActivity();
    setPurring(true);
    if (purrTimeoutRef.current) clearTimeout(purrTimeoutRef.current);
    purrTimeoutRef.current = setTimeout(() => setPurring(false), 2200);
  }

  function handleFeed() {
    registerActivity();
    setFeeding(true);
    if (feedTimeoutRef.current) clearTimeout(feedTimeoutRef.current);
    feedTimeoutRef.current = setTimeout(() => setFeeding(false), 2200);
  }

  function handleTreatPointerDown(e: React.PointerEvent) {
    treatDragRef.current = { startX: e.clientX, startY: e.clientY };
    setDraggingTreat(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleTreatPointerMove(e: React.PointerEvent) {
    const drag = treatDragRef.current;
    if (!drag) return;
    setTreatOffset({ x: e.clientX - drag.startX, y: e.clientY - drag.startY });
  }

  function handleTreatPointerUp() {
    if (!treatDragRef.current) return;
    treatDragRef.current = null;
    setDraggingTreat(false);
    const catRect = fullscreenCatRef.current?.getBoundingClientRect();
    const treatRect = treatRef.current?.getBoundingClientRect();
    if (catRect && treatRect) {
      const overlaps =
        treatRect.left < catRect.right &&
        treatRect.right > catRect.left &&
        treatRect.top < catRect.bottom &&
        treatRect.bottom > catRect.top;
      if (overlaps) handleFeed();
    }
    setTreatOffset({ x: 0, y: 0 });
  }

  const sleeping = pose === "sleeping";
  const miniExpression: CatExpression =
    mood === "surprised" ? "startled" : sleeping ? "sleepy" : blinking ? "happy" : mood === "thinking" ? "curious" : "normal";
  const badge = sleeping ? "💤" : MOOD_BADGE[mood];
  const fullscreenExpression: CatExpression = mood === "surprised" ? "startled" : feeding || purring ? "happy" : "normal";

  return (
    <>
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        title="Drag to move, click to visit me!"
        aria-label="Velora's mascot — drag to move, click to open"
        style={{
          left: position.x,
          top: position.y,
          transition: pose === "walking" ? `left ${WALK_SLIDE_MS[species]}ms ease-in-out` : undefined,
        }}
        className="fixed z-40 cursor-grab touch-none bg-transparent active:cursor-grabbing"
      >
        {testMessage && (
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs text-[#5c1f14] shadow dark:bg-gray-900 dark:text-[#e8a7a7]">
            {testMessage}
          </span>
        )}
        {sleeping && (
          <span className="pointer-events-none absolute -top-3 -right-1 text-xs font-medium text-[#b3615f]">Zzz</span>
        )}
        <span
          className={
            pose === "walking"
              ? WALK_ANIMATION_CLASS[species]
              : sleeping
                ? "block opacity-85 animate-[catBreathe_2.6s_ease-in-out_infinite]"
                : "block"
          }
        >
          <MascotArt species={species} size={CAT_SIZE} pose={pose} expression={miniExpression} />
        </span>
        {badge && (
          <span className="absolute -top-1 -right-1 rounded-full bg-white text-sm shadow dark:bg-gray-900">
            {badge}
          </span>
        )}
      </button>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90"
          onClick={() => setFullscreen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-4">
            <button
              type="button"
              ref={fullscreenCatRef}
              onClick={handlePet}
              title="Pet me on the head!"
              className="cursor-pointer bg-transparent transition-transform hover:scale-105 active:scale-95"
            >
              <MascotArt species={species} size={320} expression={fullscreenExpression} />
            </button>
            <p
              className={`font-mono text-sm text-[#e8a7a7] transition-opacity duration-200 ${
                purring || feeding ? "opacity-100" : "opacity-0"
              }`}
            >
              {feeding ? FEED_SOUND[species] : PET_SOUND[species]}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <div
                  ref={treatRef}
                  onPointerDown={handleTreatPointerDown}
                  onPointerMove={handleTreatPointerMove}
                  onPointerUp={handleTreatPointerUp}
                  title="Drag me onto them to feed them!"
                  style={{
                    transform: `translate(${treatOffset.x}px, ${treatOffset.y}px)`,
                    transition: draggingTreat ? "none" : "transform 0.3s ease",
                  }}
                  className="flex h-12 w-12 cursor-grab touch-none items-center justify-center rounded-full border border-[#d68989] bg-[#d68989]/10 text-2xl active:cursor-grabbing"
                >
                  {TREAT_EMOJI[species]}
                </div>
                <span className="text-xs text-gray-400">Drag to feed</span>
              </div>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="rounded-md border border-gray-600 px-4 py-1.5 text-sm text-gray-300 hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
