import React, { useState } from 'react';
import { useAgent } from '../hooks/useAgent';

interface Quest {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  attribute: 'strength' | 'intellect' | 'discipline' | 'vitality';
  xpReward: number;
  goldReward: number;
}

export default function AiQuestGenerator() {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playerStats] = useState({ level: 1, xp: 125, maxXp: 300, gold: 45 });
  const [quests, setQuests] = useState<Quest[]>([]);
  const { generateQuests } = useAgent();

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setIsLoading(true);
    try {
      const response = await generateQuests(goal);
      if (response && response.success && Array.isArray(response.quests)) {
        setQuests(response.quests);
      }
    } catch (err) {
      console.error("UI Generation Exception:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <header className="border-b border-slate-800 bg-[#0E1326]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <span className="font-bold text-lg text-white">⚔️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Life RPG</h1>
              <p className="text-xs text-cyan-400/80 uppercase font-semibold tracking-widest">AI Quest Master Active</p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800/80 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">LVL</span>
              <span className="text-2xl font-black text-cyan-400">{playerStats.level}</span>
            </div>
            
            <div className="flex-1 md:w-48">
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                <span>XP PROGRESS</span>
                <span>{playerStats.xp} / {playerStats.maxXp}</span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 p-[2px]">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                  style={{ width: `${(playerStats.xp / playerStats.maxXp) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
              <span className="text-amber-400 text-lg">🪙</span>
              <span className="font-bold text-amber-300 tracking-wide">{playerStats.gold}<span className="text-xs ml-0.5 text-amber-500 font-medium">G</span></span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <section className="bg-gradient-to-b from-[#12182D] to-[#0E1326] border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>🔮</span> Command the Quest Master
              </h2>
              <p className="text-sm text-slate-400">Type a real-world objective. The AI will forge your operational milestones.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Master JavaScript asynchronous network patterns..." 
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !goal.trim()}
                className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-white/5 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Forging Quests...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Generate Quests</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse" /> Active Campaign Board
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{quests.length} Objectives Available</span>
          </div>

          {quests.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/10">
              <span className="text-4xl block mb-3 opacity-40">📭</span>
              <h4 className="text-slate-300 font-semibold mb-1">The Quest Board is Empty</h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">Input a master goal above to allow the AI core to populate your tactical roadmap directives.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {quests.map((quest, index) => (
                <article 
                  key={index} 
                  className="group bg-[#0F1424] border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/20 relative"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        quest.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        quest.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {quest.difficulty}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                        🛡️ {quest.attribute}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">{quest.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{quest.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0">
                    <div className="text-right space-y-0.5">
                      <span className="text-xs font-bold text-emerald-400 block">+{quest.xpReward} <span className="text-[10px] text-slate-500 font-medium">XP</span></span>
                      <span className="text-xs font-bold text-amber-400 block">+{quest.goldReward} <span className="text-[10px] text-slate-500 font-medium">G</span></span>
                    </div>
                    
                    <button className="w-full sm:w-auto bg-slate-900 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition-all duration-200 active:scale-[0.96]">
                      ✓ Complete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
