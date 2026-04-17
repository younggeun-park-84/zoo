"use client";

import type { Segment } from "@/types/roulette";

interface SegmentEditorProps {
  segments: Segment[];
  onUpdate: (id: string, changes: Partial<Segment>) => void;
  onReset: () => void;
  isSpinning: boolean;
}

export default function SegmentEditor({ segments, onUpdate, onReset, isSpinning }: SegmentEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg tracking-wide">항목 편집</h2>
        <button
          onClick={onReset}
          disabled={isSpinning}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 border border-gray-600 hover:border-gray-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          초기화
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
        {segments.map((seg, i) => (
          <div
            key={seg.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors"
          >
            {/* Index badge */}
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-black"
              style={{ backgroundColor: seg.color }}
            >
              {i + 1}
            </span>

            {/* Color picker */}
            <label className="flex-shrink-0 relative cursor-pointer group">
              <div
                className="w-8 h-8 rounded-lg border-2 border-white/20 group-hover:border-white/60 transition-colors"
                style={{ backgroundColor: seg.color }}
              />
              <input
                type="color"
                value={seg.color}
                disabled={isSpinning}
                onChange={(e) => onUpdate(seg.id, { color: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>

            {/* Label input */}
            <input
              type="text"
              value={seg.label}
              disabled={isSpinning}
              onChange={(e) => onUpdate(seg.id, { label: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm font-medium outline-none border-b border-transparent focus:border-gray-400 transition-colors placeholder-gray-500 disabled:opacity-40"
              placeholder="항목명 입력"
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        색상 박스를 클릭하여 색상 변경, 텍스트를 직접 수정하세요
      </p>
    </div>
  );
}
