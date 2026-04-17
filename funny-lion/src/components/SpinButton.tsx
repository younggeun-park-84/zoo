"use client";

interface SpinButtonProps {
  onSpin: () => void;
  isSpinning: boolean;
}

export default function SpinButton({ onSpin, isSpinning }: SpinButtonProps) {
  return (
    <button
      onClick={onSpin}
      disabled={isSpinning}
      className={`
        mt-6 w-full max-w-[280px] mx-auto block
        py-4 px-8 rounded-2xl text-xl font-bold tracking-wider
        transition-all duration-200
        ${isSpinning
          ? "bg-gray-600 text-gray-400 cursor-not-allowed scale-95"
          : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/40 hover:scale-105 hover:shadow-purple-500/60 active:scale-95"
        }
      `}
    >
      {isSpinning ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          돌아가는 중...
        </span>
      ) : (
        "🎰 SPIN!"
      )}
    </button>
  );
}
