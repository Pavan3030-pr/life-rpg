import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAgent } from "../hooks/useAgent.js";

type GeneratedQuest = {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "epic";
  attribute: "strength" | "intellect" | "discipline" | "vitality";
  xpReward: number;
  goldReward: number;
};

type Props = {
  onQuestsAdded?: () => Promise<void>;
};

export default function AiQuestGenerator({ onQuestsAdded }: Props) {
  const agent = useAgent();
  const [goal, setGoal] = useState("");
  const [quests, setQuests] = useState<GeneratedQuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  async function generateQuests() {
    if (!goal.trim() || loading) return;

    setLoading(true);
    setMessage("");
    setQuests([]);

    try {
      const result = await agent.generateQuests(goal);

      setQuests(result.quests);
      setMessage(
        result.fallback
          ? `${result.message} +${result.xpAwarded} XP safety bonus queued.`
          : `Quest Master forged 3 quests with ${agent.model}.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function addQuests() {
    if (!quests.length || adding) return;

    setAdding(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in again.");
        return;
      }

      const rows = quests.map((quest) => ({
        user_id: user.id,
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        attribute: quest.attribute,
        xp_reward: quest.xpReward,
        gold_reward: quest.goldReward,
        status: "active",
        due_date: null,
        completed_at: null,
      }));

      const { error } = await supabase
        .from("quests")
        .insert(rows);

      if (error) {
        throw error;
      }

      setQuests([]);
      setGoal("");
      setMessage("✨ Quests added to your Quest Board!");

      await onQuestsAdded?.();
    } catch (error) {
      console.error("ADD AI QUESTS ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to add quests."
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/40 via-zinc-950 to-fuchsia-950/20 p-6 shadow-2xl shadow-violet-950/20">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-violet-500/15 p-3">
          <Sparkles className="h-6 w-6 text-violet-300" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-300">
            AI Quest Master
          </p>

          <h2 className="text-xl font-black text-white">
            Turn your goal into quests
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              generateQuests();
            }
          }}
          maxLength={200}
          placeholder="What do you want to achieve?"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
        />

        <button
          onClick={generateQuests}
          disabled={!goal.trim() || loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 text-sm font-black text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Wand2 className="h-4 w-4" />

          {loading ? "Creating..." : "Generate Quests"}
        </button>
      </div>

      {message && (
        <p aria-live="polite" className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-sm text-zinc-300">
          {message}
        </p>
      )}

      {quests.length > 0 && (
        <div className="mt-6 space-y-3">
          {quests.map((quest, index) => (
            <div
              key={`${quest.title}-${index}`}
              className="rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-bold text-white">
                    {quest.title}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-400">
                    {quest.description}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2 text-xs font-bold">
                  <span className="rounded-full bg-violet-400/10 px-3 py-1 text-violet-300">
                    {quest.difficulty}
                  </span>

                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-300">
                    +{quest.xpReward} XP
                  </span>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                    +{quest.goldReward} G
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addQuests}
            disabled={adding}
            className="mt-3 w-full rounded-2xl border border-violet-400/30 bg-violet-500/10 px-5 py-4 text-sm font-black text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50"
          >
            {adding ? "Adding..." : "⚔️ Add All Quests to Quest Board"}
          </button>
        </div>
      )}
    </section>
  );
}
