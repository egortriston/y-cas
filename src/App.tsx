import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShimmerButton } from "@/components/effects/shimmer-button";
import { cn } from "@/lib/utils";

const defaultParticipants = [
  { name: "Артем", photoUrl: "https://center.yandex-team.ru/api/v1/user/temapetrov/photo/original.jpg" },
  { name: "Егор", photoUrl: "https://center.yandex-team.ru/api/v1/user/musnitskiy/photo_979145/original.jpg" },
  { name: "Коля", photoUrl: "https://center.yandex-team.ru/api/v1/user/n-kurbatov/photo_700384/original.jpg" },
  { name: "Саша", photoUrl: "https://center.yandex-team.ru/api/v1/user/amandrov/photo_923431/original.jpg" },
  { name: "Кирилл", photoUrl: "https://center.yandex-team.ru/api/v1/user/kirvn/photo/original.jpg" },
  { name: "Соня", photoUrl: "https://center.yandex-team.ru/api/v1/user/sphsv/photo_886746/original.jpg" },
  { name: "Олег", photoUrl: "https://center.yandex-team.ru/api/v1/user/layokov/photo/original.jpg" },
  { name: "Амир", photoUrl: "https://center.yandex-team.ru/api/v1/user/ammustafaev/photo_864730/original.jpg" },
  { name: "Никита Т", photoUrl: "https://center.yandex-team.ru/api/v1/user/niktolstiakov/photo/original.jpg" },
  { name: "Никита Ч", photoUrl: "https://center.yandex-team.ru/api/v1/user/cnikitaa16/photo_818066/original.jpg" },
  { name: "Дима", photoUrl: "https://center.yandex-team.ru/api/v1/user/jonmagon/photo_648376/original.jpg" },
] as const;

const initialNames = defaultParticipants.map((participant) => participant.name).join("\n");
const defaultPhotoByName = new Map<string, string>(defaultParticipants.map((participant) => [participant.name, participant.photoUrl]));

type DrawPhase = "idle" | "shuffling" | "eliminating" | "revealed";

type CardPlacement = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  width: number;
  height: number;
  layer: number;
};

function parseNames(value: string) {
  return value
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean);
}

function pluralizeRu(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

function shuffleIndexes(length: number, winnerIndex: number) {
  const indexes = Array.from({ length }, (_, index) => index).filter((index) => index !== winnerIndex);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

function seededOffset(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 980, height: 650 });

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const element = ref.current;
    const updateSize = () => {
      setSize({
        width: element.clientWidth || 980,
        height: element.clientHeight || 650,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

function buildTableLayout(count: number, width: number, height: number): CardPlacement[] {
  if (!count) {
    return [];
  }

  const safeWidth = Math.max(width, 320);
  const safeHeight = Math.max(height, 420);
  const columns = count <= 5 ? count : count <= 10 ? Math.ceil(count / 2) : count <= 18 ? 6 : 8;
  const rows = Math.ceil(count / columns);
  const horizontalPadding = safeWidth < 720 ? 34 : 106;
  const verticalPadding = safeHeight < 560 ? 78 : 140;
  const cardWidth = Math.min(174, Math.max(96, (safeWidth - horizontalPadding - (columns - 1) * 18) / columns));
  const cardHeight = cardWidth * 1.36;
  const stepX = columns === 1 ? 0 : Math.min(cardWidth + 36, (safeWidth - horizontalPadding - cardWidth) / (columns - 1));
  const stepY =
    rows === 1 ? 0 : Math.min(cardHeight * 0.9, Math.max(cardHeight * 0.68, (safeHeight - verticalPadding - cardHeight) / (rows - 1)));
  const startY = rows === 1 ? 18 : -((rows - 1) * stepY) / 2 + 34;

  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const rowCount = row === rows - 1 ? count - row * columns : columns;
    const centeredCol = col - (rowCount - 1) / 2;
    const rowCurve = rows === 1 ? 0 : (row - (rows - 1) / 2) * 6;
    const rowStagger = rows === 1 ? 0 : (row % 2 === 0 ? -0.045 : 0.055) * stepX;
    const jitterX = seededOffset(index, 1) * Math.min(24, cardWidth * 0.17);
    const jitterY = seededOffset(index, 2) * Math.min(20, cardHeight * 0.1);
    const rotateJitter = seededOffset(index, 3) * 4.2;

    return {
      x: centeredCol * stepX + rowStagger + jitterX,
      y: startY + row * stepY + rowCurve + jitterY,
      rotate: centeredCol * 1.2 + (row - (rows - 1) / 2) * 0.48 + rotateJitter,
      scale: Math.max(0.84, 1 - Math.max(0, rows - 2) * 0.024 + seededOffset(index, 4) * 0.018),
      width: cardWidth,
      height: cardHeight,
      layer: row * columns + col,
    };
  });
}

function useAmbientMotion() {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!scope.current) {
      return;
    }

    const context = gsap.context(() => {
      gsap.to(".stage-ambient", {
        opacity: 0.88,
        scale: 1.035,
        duration: 5.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }, scope);

    return () => context.revert();
  }, []);

  return scope;
}

function ParticipantCard({
  name,
  index,
  placement,
  active,
  winner,
  phase,
  reducedMotion,
  photoUrl,
}: {
  name: string;
  index: number;
  placement: CardPlacement;
  active: boolean;
  winner: boolean;
  phase: DrawPhase;
  reducedMotion: boolean;
  photoUrl?: string;
}) {
  const revealScale = Math.min(1.78, Math.max(1.28, 252 / placement.width));
  const exitDirection = index % 2 === 0 ? -1 : 1;
  const isRevealedWinner = winner && phase === "revealed";
  const isShuffling = phase === "shuffling" && !reducedMotion;
  const shuffleX = seededOffset(index, 7) * Math.min(52, placement.width * 0.28);
  const shuffleY = seededOffset(index, 8) * Math.min(42, placement.height * 0.18);
  const shuffleRotate = seededOffset(index, 9) * 10;
  const [photoFailed, setPhotoFailed] = useState(false);
  const visiblePhotoUrl = photoUrl && !photoFailed ? photoUrl : undefined;

  useLayoutEffect(() => {
    setPhotoFailed(false);
  }, [photoUrl]);

  return (
    <motion.article
      layout
      className={cn("participant-card absolute left-1/2 top-1/2", visiblePhotoUrl && "has-photo", active && "is-active", winner && "is-winner")}
      style={{
        width: placement.width,
        height: placement.height,
        marginLeft: -placement.width / 2,
        marginTop: -placement.height / 2,
        zIndex: winner ? 40 : 10 + placement.layer,
      }}
      initial={{
        opacity: 0,
        x: placement.x,
        y: reducedMotion ? placement.y : placement.y + 24,
        rotate: placement.rotate,
        scale: placement.scale * (reducedMotion ? 1 : 0.96),
      }}
      animate={
        isRevealedWinner
          ? { opacity: 1, x: 0, y: -8, rotate: 0, scale: revealScale }
          : isShuffling
            ? {
                opacity: 1,
                x: [placement.x, placement.x + shuffleX, placement.x - shuffleX * 0.48, placement.x + shuffleX * 0.12, placement.x],
                y: [placement.y, placement.y + shuffleY, placement.y - shuffleY * 0.42, placement.y + shuffleY * 0.1, placement.y],
                rotate: [
                  placement.rotate,
                  placement.rotate + shuffleRotate,
                  placement.rotate - shuffleRotate * 0.58,
                  placement.rotate + shuffleRotate * 0.22,
                  placement.rotate,
                ],
                scale: [placement.scale, placement.scale * 1.045, placement.scale * 0.985, placement.scale * 1.015, placement.scale],
              }
          : {
              opacity: 1,
              x: placement.x,
              y: placement.y,
              rotate: active ? placement.rotate + exitDirection * 0.9 : placement.rotate,
              scale: active ? placement.scale * 1.03 : placement.scale,
            }
      }
      exit={{
        opacity: 0,
        x: placement.x + exitDirection * (reducedMotion ? 70 : 220),
        y: placement.y - (reducedMotion ? 34 : 170),
        rotate: placement.rotate + exitDirection * 14,
        scale: placement.scale * 0.74,
      }}
      transition={{
        ...(isRevealedWinner
          ? {
              type: "spring",
              stiffness: 88,
              damping: 15,
            }
          : isShuffling
            ? {
                type: "tween",
                duration: 1.34,
                times: [0, 0.34, 0.63, 0.82, 1],
                ease: [0.16, 1, 0.3, 1],
              }
            : {
                type: "tween",
                duration: reducedMotion ? 0.22 : 0.68,
                ease: [0.16, 1, 0.3, 1],
              }),
      }}
      aria-label={`Карта участника ${name}`}
    >
      <div className="participant-card__shadow" />
      <div className="participant-card__side" />
      <div className="participant-card__face">
        <div className="participant-card__meta">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>Я</span>
        </div>
        {visiblePhotoUrl ? (
          <div className="participant-card__portrait">
            <img src={visiblePhotoUrl} alt="" loading="lazy" onError={() => setPhotoFailed(true)} />
          </div>
        ) : null}
        <strong>{name}</strong>
        <small>{winner && phase === "revealed" ? "ведет" : "участник"}</small>
      </div>
    </motion.article>
  );
}

function CardTable({
  names,
  remainingIndexes,
  winnerIndex,
  activeIndex,
  phase,
  reducedMotion,
}: {
  names: string[];
  remainingIndexes: number[];
  winnerIndex: number | null;
  activeIndex: number | null;
  phase: DrawPhase;
  reducedMotion: boolean;
}) {
  const [tableRef, size] = useMeasure<HTMLDivElement>();
  const placements = useMemo(() => buildTableLayout(names.length, size.width, size.height), [names.length, size.height, size.width]);
  const remainingSet = useMemo(() => new Set(remainingIndexes), [remainingIndexes]);

  return (
    <section ref={tableRef} className="stage relative min-h-[34rem] overflow-hidden rounded-[2rem] max-lg:min-h-[31rem] max-sm:min-h-[28rem]">
      <div className="stage-ambient" />
      <div className="stage-brand-mark" aria-hidden="true">
        Я
      </div>

      {names.length === 0 ? (
        <div className="relative z-20 grid h-full min-h-[28rem] place-items-center px-8 text-center">
          <div className="max-w-md">
            <h2 className="text-balance font-display text-[clamp(2.7rem,7vw,6rem)] font-light leading-[0.9] tracking-[-0.08em] text-white">
              Введите участников
            </h2>
            <p className="mx-auto mt-5 max-w-sm text-pretty text-base leading-7 text-white/52">Имена добавляются в блоке слева, по одному в строке.</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-20">
          <AnimatePresence>
            {names.map((name, index) =>
              remainingSet.has(index) ? (
                <ParticipantCard
                  key={index}
                  name={name}
                  index={index}
                  placement={placements[index]}
                  active={activeIndex === index}
                  winner={phase === "revealed" && winnerIndex === index}
                  phase={phase}
                  reducedMotion={reducedMotion}
                  photoUrl={defaultPhotoByName.get(name)}
                />
              ) : null,
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [rawNames, setRawNames] = useState(initialNames);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<DrawPhase>("idle");
  const [remainingIndexes, setRemainingIndexes] = useState<number[]>(() => parseNames(initialNames).map((_, index) => index));
  const [eliminationOrder, setEliminationOrder] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const scope = useAmbientMotion();
  const reducedMotion = useReducedMotion();
  const names = useMemo(() => parseNames(rawNames), [rawNames]);
  const winnerName = phase === "revealed" && winnerIndex !== null ? names[winnerIndex] : null;
  const canDraw = names.length >= 2 && phase !== "shuffling" && phase !== "eliminating";

  function clearTimers() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }

  function resetDraw(nextRawNames = rawNames) {
    const nextNames = parseNames(nextRawNames);

    clearTimers();
    setWinnerIndex(null);
    setEliminationOrder([]);
    setActiveIndex(null);
    setRemainingIndexes(nextNames.map((_, index) => index));
    setPhase("idle");
  }

  useLayoutEffect(() => () => clearTimers(), []);

  useLayoutEffect(() => {
    if (phase !== "eliminating" || winnerIndex === null || eliminationOrder.length === 0) {
      return;
    }

    clearTimers();

    const step = reducedMotion ? 160 : Math.max(500, Math.min(780, 6400 / eliminationOrder.length));
    const openingDelay = reducedMotion ? 90 : 260;

    eliminationOrder.forEach((index, orderIndex) => {
      const at = openingDelay + orderIndex * step;
      const removeAt = at + Math.min(reducedMotion ? 70 : 340, step * 0.46);

      timers.current.push(
        window.setTimeout(() => {
          setActiveIndex(index);
        }, at),
      );

      timers.current.push(
        window.setTimeout(() => {
          setRemainingIndexes((current) => current.filter((cardIndex) => cardIndex !== index));
        }, removeAt),
      );
    });

    const finaleAt = openingDelay + eliminationOrder.length * step + (reducedMotion ? 160 : 760);

    timers.current.push(
      window.setTimeout(() => {
        setActiveIndex(winnerIndex);
      }, Math.max(0, finaleAt - (reducedMotion ? 90 : 500))),
    );

    timers.current.push(
      window.setTimeout(() => {
        setRemainingIndexes([winnerIndex]);
        setPhase("revealed");
        setActiveIndex(null);
      }, finaleAt),
    );

    return () => clearTimers();
  }, [eliminationOrder, names, phase, reducedMotion, winnerIndex]);

  function drawCard() {
    if (phase === "shuffling" || phase === "eliminating") {
      return;
    }

    if (names.length < 2) {
      setWinnerIndex(null);
      setRemainingIndexes(names.map((_, index) => index));
      setPhase("idle");
      return;
    }

    const nextWinnerIndex = Math.floor(Math.random() * names.length);
    const nextEliminationOrder = shuffleIndexes(names.length, nextWinnerIndex);
    const shuffleDelay = reducedMotion ? 220 : 1360;

    clearTimers();
    setWinnerIndex(nextWinnerIndex);
    setRemainingIndexes(names.map((_, index) => index));
    setEliminationOrder(nextEliminationOrder);
    setActiveIndex(null);
    setPhase("shuffling");

    timers.current.push(
      window.setTimeout(() => {
        setPhase("eliminating");
      }, shuffleDelay),
    );
  }

  function clearAll() {
    setRawNames("");
    resetDraw("");
  }

  return (
    <main ref={scope} className="relative min-h-dvh overflow-x-hidden bg-black font-sans text-white">
      <div className="reference-backdrop absolute inset-0" />
      <div className="grain-overlay" />

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1540px] flex-col px-6 py-6 max-sm:px-3">
        <header className="topbar flex items-center justify-between gap-6 border-b border-white/10 pb-5 max-sm:gap-3">
          <div className="flex items-center gap-4">
            <span className="brand-dot" />
            <strong className="font-display text-lg font-semibold uppercase tracking-[0.48em] text-white max-sm:tracking-[0.24em]">mezcal</strong>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button size="default" variant="secondary" onClick={clearAll} className="rounded-full max-sm:hidden">
              Очистить
            </Button>
          </div>
        </header>

        <div className="workspace grid flex-1 grid-cols-[minmax(300px,360px)_minmax(0,1fr)] gap-8 pt-8 max-lg:grid-cols-1 max-lg:gap-5 max-lg:pt-5">
          <aside className="participants-panel">
            <div className="panel-heading">
              <div>
                <h2>Участники</h2>
                <p>{names.length} {pluralizeRu(names.length, "имя", "имени", "имен")}</p>
              </div>
            </div>

            <div className="names-box">
              <Textarea
                id="namesInput"
                value={rawNames}
                onChange={(event) => {
                  setRawNames(event.target.value);
                  resetDraw(event.target.value);
                }}
                placeholder={"Артем\nЕгор\nКоля\nСаша"}
                spellCheck={false}
                className="names-textarea min-h-[28rem] rounded-none border-0 bg-transparent p-0 text-[1.08rem] font-medium leading-[2.15rem] shadow-none outline-none focus:bg-transparent focus:ring-0 max-lg:min-h-[14rem]"
              />
            </div>

            <div className="control-block">
              <ShimmerButton
                size="lg"
                onClick={drawCard}
                disabled={!canDraw}
                className="h-16 w-full rounded-full font-display text-base font-bold uppercase tracking-[0.18em] active:scale-[0.985]"
              >
                {phase === "shuffling" ? "Тасуем" : phase === "eliminating" ? "Идет выбор" : phase === "revealed" ? "Выбрать заново" : "Запустить"}
              </ShimmerButton>
            </div>
          </aside>

          <section className="main-panel">
            <CardTable
              names={names}
              remainingIndexes={remainingIndexes}
              winnerIndex={winnerIndex}
              activeIndex={activeIndex}
              phase={phase}
              reducedMotion={Boolean(reducedMotion)}
            />
          </section>
        </div>
      </section>
    </main>
  );
}
