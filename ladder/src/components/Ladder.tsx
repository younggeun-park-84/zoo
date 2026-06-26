"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

/** 한 사다리 가로줄: row 높이의 col 번째 세로줄과 col+1 세로줄을 연결 */
type Rung = { row: number; col: number };

type Point = { x: number; y: number };

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const ROWS = 11; // 가로줄이 놓일 수 있는 칸의 수

// 참가자별 경로/결과 색상
const COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

/** 인접한 가로줄이 겹치지 않도록(한 점에 두 줄이 닿지 않도록) 무작위 사다리 생성 */
function generateLadder(cols: number): Rung[] {
  const rungs: Rung[] = [];
  for (let row = 0; row < ROWS; row++) {
    let prevPlaced = false;
    for (let col = 0; col < cols - 1; col++) {
      if (prevPlaced) {
        prevPlaced = false; // 바로 옆 칸은 비워 충돌 방지
        continue;
      }
      if (Math.random() < 0.5) {
        rungs.push({ row, col });
        prevPlaced = true;
      }
    }
  }
  return rungs;
}

/** 시작 세로줄(startCol)에서 출발해 사다리를 따라 내려간 경로와 도착 칸을 계산 */
function tracePath(startCol: number, rungs: Rung[]): { points: Point[]; endCol: number } {
  let col = startCol;
  const points: Point[] = [{ x: col, y: 0 }];
  for (let row = 0; row < ROWS; row++) {
    const right = rungs.some((g) => g.row === row && g.col === col);
    const left = rungs.some((g) => g.row === row && g.col === col - 1);
    if (right) {
      points.push({ x: col, y: row + 0.5 });
      col += 1;
      points.push({ x: col, y: row + 0.5 });
    } else if (left) {
      points.push({ x: col, y: row + 0.5 });
      col -= 1;
      points.push({ x: col, y: row + 0.5 });
    }
  }
  points.push({ x: col, y: ROWS });
  return { points, endCol: col };
}

/** 결과 텍스트가 '당첨'을 포함하면 당첨으로 간주 */
function isWin(text: string | undefined): boolean {
  return !!text && text.includes("당첨");
}

const CONFETTI_COLORS = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#facc15",
];

/** 당첨 시 화면 가득 떨어지는 폭죽(색종이) 효과 — 외부 라이브러리 없이 CSS로 구현 */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 8,
        duration: 2.5 + Math.random() * 1.8,
        delay: Math.random() * 0.6,
        drift: (Math.random() * 2 - 1) * 30,
        spin: 360 + Math.random() * 720,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        round: Math.random() < 0.4,
      })),
    [],
  );

  return (
    <div className="confetti-root" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}vw`,
              width: `${p.size}px`,
              height: `${p.size * (p.round ? 1 : 1.6)}px`,
              backgroundColor: p.color,
              borderRadius: p.round ? "9999px" : "2px",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}vw`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function Ladder() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [names, setNames] = useState<string[]>(["", "", "", ""]);
  const [results, setResults] = useState<string[]>(["꽝", "당첨", "꽝", "꽝"]);
  const [rungs, setRungs] = useState<Rung[]>([]);
  // 활성화된 경로: startCol -> 경로 좌표
  const [activePaths, setActivePaths] = useState<Record<number, Point[]>>({});
  // 결과 공개 여부: startCol -> endCol
  const [revealed, setRevealed] = useState<Record<number, number>>({});
  const [running, setRunning] = useState(false);
  // 당첨 폭죽 효과
  const [celebrate, setCelebrate] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  // 폭죽을 새로 터뜨리고 약 3.5초 뒤 자동 정리
  const fireConfetti = useCallback(() => {
    setConfettiKey((k) => k + 1);
    setCelebrate(true);
    const t = setTimeout(() => setCelebrate(false), 3500);
    timeouts.current.push(t);
  }, []);

  // 사다리 새로 생성 (클라이언트에서만 — SSR 하이드레이션 불일치 방지)
  const regenerate = useCallback(() => {
    clearTimers();
    setActivePaths({});
    setRevealed({});
    setRunning(false);
    setRungs(generateLadder(numPlayers));
  }, [numPlayers, clearTimers]);

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPlayers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // 인원수 변경 시 이름/결과 배열 길이 맞추기
  const setCount = (next: number) => {
    const n = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, next));
    setNumPlayers(n);
    setNames((prev) => {
      const copy = [...prev];
      copy.length = n;
      return Array.from({ length: n }, (_, i) => copy[i] ?? "");
    });
    setResults((prev) => {
      const copy = [...prev];
      copy.length = n;
      return Array.from({ length: n }, (_, i) => copy[i] ?? "");
    });
  };

  const shuffleResults = () => {
    setResults((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    setActivePaths({});
    setRevealed({});
  };

  // SVG 좌표계: 한 칸 = 100단위, 각 세로줄은 칸의 중앙에 위치
  const CELL = 100;
  const vbWidth = numPlayers * CELL;
  const TOP = 24;
  const BOTTOM = 384;
  const vbHeight = BOTTOM + 24;

  const colX = useCallback((col: number) => (col + 0.5) * CELL, []);
  const rowY = useCallback(
    (y: number) => TOP + (y / ROWS) * (BOTTOM - TOP),
    [],
  );

  const toPixels = useCallback(
    (points: Point[]) => points.map((p) => `${colX(p.x)},${rowY(p.y)}`).join(" "),
    [colX, rowY],
  );

  const runOne = useCallback(
    (startCol: number) => {
      if (running && !activePaths[startCol]) return;
      const { points, endCol } = tracePath(startCol, rungs);
      setActivePaths((prev) => ({ ...prev, [startCol]: points }));
      setRevealed((prev) => {
        const copy = { ...prev };
        delete copy[startCol];
        return copy;
      });
      const t = setTimeout(() => {
        setRevealed((prev) => ({ ...prev, [startCol]: endCol }));
        if (isWin(results[endCol])) fireConfetti();
      }, 1400);
      timeouts.current.push(t);
    },
    [rungs, running, activePaths, results, fireConfetti],
  );

  const runAll = useCallback(() => {
    clearTimers();
    setRunning(true);
    const paths: Record<number, Point[]> = {};
    const ends: Record<number, number> = {};
    for (let c = 0; c < numPlayers; c++) {
      const { points, endCol } = tracePath(c, rungs);
      paths[c] = points;
      ends[c] = endCol;
    }
    setActivePaths(paths);
    setRevealed({});
    const t = setTimeout(() => {
      setRevealed(ends);
      if (Object.values(ends).some((endCol) => isWin(results[endCol]))) {
        fireConfetti();
      }
    }, 1500);
    timeouts.current.push(t);
  }, [numPlayers, rungs, clearTimers, results, fireConfetti]);

  const reset = () => {
    clearTimers();
    setActivePaths({});
    setRevealed({});
    setRunning(false);
  };

  const cols = useMemo(() => Array.from({ length: numPlayers }, (_, i) => i), [numPlayers]);

  return (
    <div className="w-full max-w-3xl">
      {celebrate && <Confetti key={confettiKey} />}
      {/* 컨트롤 바 */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-white/70 px-2 py-1 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
          <span className="pl-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            인원
          </span>
          <button
            type="button"
            onClick={() => setCount(numPlayers - 1)}
            disabled={numPlayers <= MIN_PLAYERS}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 transition hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-500/20 dark:text-indigo-300"
            aria-label="인원 줄이기"
          >
            −
          </button>
          <span className="w-6 text-center text-lg font-bold tabular-nums text-gray-800 dark:text-gray-100">
            {numPlayers}
          </span>
          <button
            type="button"
            onClick={() => setCount(numPlayers + 1)}
            disabled={numPlayers >= MAX_PLAYERS}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 transition hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-500/20 dark:text-indigo-300"
            aria-label="인원 늘리기"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={regenerate}
          className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white dark:bg-white/10 dark:text-gray-200 dark:ring-white/10"
        >
          🔀 사다리 다시
        </button>
        <button
          type="button"
          onClick={shuffleResults}
          className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white dark:bg-white/10 dark:text-gray-200 dark:ring-white/10"
        >
          🎲 결과 섞기
        </button>
        <button
          type="button"
          onClick={runAll}
          className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
        >
          ▶ 전체 출발
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-3 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ↺ 지우기
        </button>
      </div>

      {/* 상단: 참가자 이름 입력 */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${numPlayers}, minmax(0, 1fr))` }}
      >
        {cols.map((c) => (
          <button
            key={`name-${c}`}
            type="button"
            onClick={() => runOne(c)}
            className="group relative flex flex-col items-center"
          >
            <input
              value={names[c] ?? ""}
              onChange={(e) =>
                setNames((prev) => {
                  const copy = [...prev];
                  copy[c] = e.target.value;
                  return copy;
                })
              }
              onClick={(e) => e.stopPropagation()}
              placeholder={`참가자 ${c + 1}`}
              className="w-full rounded-lg border-2 px-1 py-2 text-center text-sm font-semibold outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:bg-white/5 dark:text-gray-100 dark:focus:ring-indigo-500/30"
              style={{ borderColor: COLORS[c % COLORS.length] }}
            />
            <span
              className="mt-1 h-2 w-2 rounded-full transition group-hover:scale-150"
              style={{ backgroundColor: COLORS[c % COLORS.length] }}
            />
          </button>
        ))}
      </div>

      {/* 사다리 SVG */}
      <div className="my-1 w-full">
        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="h-auto w-full touch-none select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="사다리"
        >
          {/* 세로줄 */}
          {cols.map((c) => (
            <line
              key={`v-${c}`}
              x1={colX(c)}
              y1={rowY(0)}
              x2={colX(c)}
              y2={rowY(ROWS)}
              stroke="currentColor"
              className="text-gray-300 dark:text-gray-600"
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}

          {/* 가로줄 */}
          {rungs.map((g, i) => (
            <line
              key={`r-${i}`}
              x1={colX(g.col)}
              y1={rowY(g.row + 0.5)}
              x2={colX(g.col + 1)}
              y2={rowY(g.row + 0.5)}
              stroke="currentColor"
              className="text-gray-400 dark:text-gray-500"
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}

          {/* 활성 경로 (애니메이션) */}
          {Object.entries(activePaths).map(([startCol, points]) => {
            const sc = Number(startCol);
            const color = COLORS[sc % COLORS.length];
            return (
              <polyline
                key={`path-${startCol}`}
                points={toPixels(points)}
                fill="none"
                stroke={color}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                className="ladder-path"
              />
            );
          })}
        </svg>
      </div>

      {/* 하단: 결과 입력 + 공개 */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${numPlayers}, minmax(0, 1fr))` }}
      >
        {cols.map((c) => {
          // 이 결과 칸(endCol=c)에 도착한 시작 참가자 찾기
          const arriverEntry = Object.entries(revealed).find(
            ([, endCol]) => endCol === c,
          );
          const arriverCol = arriverEntry ? Number(arriverEntry[0]) : null;
          const arriverName =
            arriverCol !== null
              ? names[arriverCol]?.trim() || `참가자 ${arriverCol + 1}`
              : null;
          return (
            <div key={`res-${c}`} className="flex flex-col items-center">
              <input
                value={results[c] ?? ""}
                onChange={(e) =>
                  setResults((prev) => {
                    const copy = [...prev];
                    copy[c] = e.target.value;
                    return copy;
                  })
                }
                placeholder={`결과 ${c + 1}`}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-1 py-2 text-center text-sm font-semibold outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-white/5 dark:text-gray-100 dark:focus:ring-purple-500/30"
              />
              <span
                className="mt-1 h-5 text-center text-xs font-bold transition"
                style={{
                  color: arriverCol !== null ? COLORS[arriverCol % COLORS.length] : undefined,
                }}
              >
                {arriverName ? `← ${arriverName}` : ""}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
        참가자 이름을 누르면 그 사람만, <strong>전체 출발</strong>을 누르면 모두 한 번에 내려가요.
      </p>

      <style>{`
        .ladder-path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: ladder-draw 1.4s ease-in-out forwards;
        }
        @keyframes ladder-draw {
          to { stroke-dashoffset: 0; }
        }
        .confetti-root {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 50;
        }
        .confetti-piece {
          position: absolute;
          top: -10vh;
          will-change: transform, opacity;
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.25, 0.6, 0.55, 1);
          animation-fill-mode: forwards;
        }
        @keyframes confetti-fall {
          0%   { transform: translate3d(0, -10vh, 0) rotateZ(0deg); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translate3d(var(--drift), 110vh, 0) rotateZ(var(--spin)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece { display: none; }
        }
      `}</style>
    </div>
  );
}
