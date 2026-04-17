"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Segment } from "@/types/roulette";

interface ResultModalProps {
  winner: Segment | null;
  onClose: () => void;
}

export default function ResultModal({ winner, onClose }: ResultModalProps) {
  const confettiRef = useRef(false);

  useEffect(() => {
    if (winner && !confettiRef.current) {
      confettiRef.current = true;
      import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: [winner.color, "#ffffff", "#ffd700"],
        });
      });
    }
    if (!winner) confettiRef.current = false;
  }, [winner]);

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal card */}
          <motion.div
            className="relative z-10 text-center rounded-3xl p-10 max-w-sm w-full shadow-2xl"
            style={{ backgroundColor: winner.color + "22", borderColor: winner.color + "66", border: "2px solid" }}
            initial={{ scale: 0.5, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-3xl opacity-20 blur-2xl"
              style={{ backgroundColor: winner.color }}
            />

            <div className="relative">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-white/70 text-lg mb-2 font-medium tracking-widest uppercase">당첨!</p>
              <div
                className="text-5xl font-extrabold mb-6 drop-shadow-lg"
                style={{ color: winner.color, textShadow: `0 0 30px ${winner.color}88` }}
              >
                {winner.label}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: winner.color }}
              >
                다시 돌리기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
