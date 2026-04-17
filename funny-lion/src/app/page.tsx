"use client";

import { useRoulette } from "@/hooks/useRoulette";
import RouletteWheel from "@/components/RouletteWheel";
import SpinButton from "@/components/SpinButton";
import SegmentEditor from "@/components/SegmentEditor";
import ResultModal from "@/components/ResultModal";

export default function Home() {
  const { segments, isSpinning, rotation, winner, spin, updateSegment, resetSegments, setWinner } = useRoulette();

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="text-center pt-8 pb-4 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            LUCKY SPIN
          </span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">행운의 룰렛</p>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-8 px-4 pb-10 max-w-6xl mx-auto w-full">

        {/* Left: Wheel */}
        <div className="flex flex-col items-center w-full lg:max-w-[520px]">
          <div className="relative w-full pt-4">
            <RouletteWheel segments={segments} rotation={rotation} />
          </div>
          <SpinButton onSpin={spin} isSpinning={isSpinning} />
        </div>

        {/* Right: Editor */}
        <div className="w-full lg:max-w-[340px] lg:self-stretch">
          <div className="h-full bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-5 shadow-xl">
            <SegmentEditor
              segments={segments}
              onUpdate={updateSegment}
              onReset={resetSegments}
              isSpinning={isSpinning}
            />
          </div>
        </div>
      </div>

      {/* Result modal */}
      <ResultModal winner={winner} onClose={() => setWinner(null)} />
    </main>
  );
}
