import { useEffect, useState } from "react";
import { Check, Plus, Swords, Target, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { apiUrl } from "../lib/api";

type Quest = {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "epic";
  attribute: "strength" | "intellect" | "discipline" | "vitality";
  xp_reward: number;
  gold_reward: number;
  status: "active" | "completed" | "archived";
};

type Props = {
  onProgressChange?: () => Promise<void>;
};

export default function Quests({ onProgressChange }: Props) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const [reward, setReward] = useState<Quest | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadQuests() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setQuests([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("quests")
        .select(
          "id,title,description,difficulty,attribute,xp_reward,gold_reward,status"
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setQuests(data || []);
    } catch (err) {
      console.error("LOAD QUESTS ERROR:", err);
      setError("Failed to load quests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuests();
  }, []);

  async function addQuest() {
    if (!title.trim() || adding) return;

    setAdding(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in again.");
        return;
      }

      const { error: insertError } = await supabase.from("quests").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        difficulty: "medium",
        attribute: "discipline",
        xp_reward: 50,
        gold_reward: 10,
        status: "active",
      });

      if (insertError) throw insertError;

      setTitle("");
      setDescription("");

      await loadQuests();
    } catch (err) {
      console.error("ADD QUEST ERROR:", err);
      setError("Failed to create quest.");
    } finally {
      setAdding(false);
    }
  }

  async function completeQuest(quest: Quest) {
    if (completing) return;

    setCompleting(quest.id);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Please log in again.");
        return;
      }

      const response = await fetch(
        apiUrl("/api/quests/complete"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            questId: quest.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to complete quest.");
      }

      console.log("QUEST REWARD:", result);

      setReward(quest);

      window.setTimeout(() => {
        setReward(null);
      }, 2200);

      if (result.newLevel) {
        const {
          data: latestProfile,
        } = await supabase
          .from("profiles")
          .select("level")
          .eq("id", session.user.id)
          .single();

        if (latestProfile && latestProfile.level === result.newLevel) {
          setLevelUp(result.newLevel);

          window.setTimeout(() => {
            setLevelUp(null);
          }, 3000);
        }
      }

      await loadQuests();
      await onProgressChange?.();
    } catch (err) {
      console.error("COMPLETE QUEST ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete quest."
      );
    } finally {
      setCompleting(null);
    }
  }

  const difficultyStyle: Record<Quest["difficulty"], string> = {
    easy: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    medium: "bg-blue-400/10 text-blue-300 border-blue-400/20",
    hard: "bg-orange-400/10 text-orange-300 border-orange-400/20",
    epic: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  };

  return (
    <section className="space-y-6">
      {reward && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="animate-[questReward_2.2s_ease-out_forwards] rounded-3xl border border-amber-400/40 bg-zinc-950/95 px-10 py-8 text-center shadow-2xl shadow-amber-500/20">
            <div className="text-5xl">⚔️</div>

            <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              Quest Complete
            </p>

            <h2 className="mt-2 max-w-md text-2xl font-black text-white">
              {reward.title}
            </h2>

            <div className="mt-4 flex justify-center gap-3">
              <span className="rounded-full bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300">
                +{reward.xp_reward} XP
              </span>

              <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                +{reward.gold_reward} G
              </span>
            </div>
          </div>
        </div>
      )}

      {levelUp && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
          <div className="rounded-3xl border border-yellow-400/50 bg-zinc-950/95 px-12 py-10 text-center shadow-2xl shadow-yellow-500/30">
            <div className="text-6xl">🏆</div>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
              Level Up
            </p>

            <h2 className="mt-2 text-4xl font-black text-white">
              Level {levelUp}
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Your adventure grows stronger.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-amber-500/10 p-3">
            <Target className="h-6 w-6 text-amber-300" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
              New Quest
            </p>

            <h2 className="text-xl font-black text-white">
              Add a real-world challenge
            </h2>
          </div>
        </div>

        <div className="grid gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addQuest();
            }}
            placeholder="Quest title..."
            maxLength={100}
            className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-400/40"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what you need to accomplish..."
            maxLength={300}
            rows={3}
            className="resize-none rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-400/40"
          />

          <button
            onClick={addQuest}
            disabled={!title.trim() || adding}
            className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-4 text-sm font-black text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            {adding ? "Creating..." : "Create Quest"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <X className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center gap-3">
          <Swords className="h-5 w-5 text-violet-300" />

          <h2 className="text-xl font-black text-white">
            Quest Board
          </h2>

          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-zinc-400">
            {quests.length}
          </span>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 text-center text-sm text-zinc-500">
            Loading quests...
          </div>
        ) : quests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950/40 p-10 text-center">
            <div className="text-4xl">🗺️</div>
            <h3 className="mt-3 font-bold text-white">
              No active quests
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Create a quest or use the AI Quest Master.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {quests.map((quest) => (
              <article
                key={quest.id}
                className="group rounded-3xl border border-white/10 bg-zinc-950/70 p-5 transition hover:border-violet-400/20 hover:bg-zinc-900/70"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${difficultyStyle[quest.difficulty]}`}
                      >
                        {quest.difficulty}
                      </span>

                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase text-zinc-500">
                        {quest.attribute}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">
                      {quest.title}
                    </h3>

                    {quest.description && (
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
                        {quest.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-300">
                        +{quest.xp_reward} XP
                      </div>

                      <div className="text-xs font-bold text-emerald-300">
                        +{quest.gold_reward} G
                      </div>
                    </div>

                    <button
                      onClick={() => completeQuest(quest)}
                      disabled={completing === quest.id}
                      className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-40"
                    >
                      <Check className="h-4 w-4" />
                      {completing === quest.id ? "Completing..." : "Complete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
