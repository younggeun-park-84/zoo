"use client";

import { useState, useCallback } from "react";
import { animate } from "framer-motion";
import { Segment, DEFAULT_SEGMENTS } from "@/types/roulette";

export function useRoulette() {
  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Segment | null>(null);

  const spin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const extraSpins = 5 * 360; // 5 full rotations
    const randomExtra = Math.random() * 360;
    const targetRotation = rotation + extraSpins + randomExtra;

    animate(rotation, targetRotation, {
      duration: 5,
      ease: [0.17, 0.67, 0.35, 1.0],
      onUpdate: (value) => setRotation(value),
      onComplete: () => {
        const finalAngle = ((targetRotation % 360) + 360) % 360;
        // Pointer is at 12 o'clock (top). In SVG coords, -90deg offset means:
        // wheelAngle = (270 - finalAngle + 360) % 360
        const wheelAngle = (270 - finalAngle + 360) % 360;
        const segmentAngle = 360 / segments.length;
        const winnerIndex = Math.floor(wheelAngle / segmentAngle);
        setWinner(segments[winnerIndex % segments.length]);
        setRotation(targetRotation % 360);
        setIsSpinning(false);
      },
    });
  }, [isSpinning, rotation, segments]);

  const updateSegment = useCallback((id: string, changes: Partial<Segment>) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, ...changes } : seg))
    );
  }, []);

  const resetSegments = useCallback(() => {
    setSegments(DEFAULT_SEGMENTS);
  }, []);

  return { segments, isSpinning, rotation, winner, spin, updateSegment, resetSegments, setWinner };
}
