import Ladder from "@/components/Ladder";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-50 to-indigo-100 px-4 py-10 dark:from-slate-950 dark:to-indigo-950">
      <header className="text-center">
        <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
          사다리타기 🪜
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          참가자와 결과를 정하고, 사다리를 타고 내려가 운명을 확인하세요!
        </p>
      </header>

      <Ladder />

      <footer className="text-xs text-gray-400">
        Next.js &amp; Tailwind CSS로 제작
      </footer>
    </main>
  );
}
