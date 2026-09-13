import { useEffect, useMemo, useState } from "react";
import {
  Backpack,
  Bot,
  Brain,
  ChevronRight,
  Flame,
  Heart,
  LayoutDashboard,
  LogOut,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Store,
  Swords,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import Quests from "./Quests";
import Shop from "./Shop";
import Inventory from "./Inventory";
import AiQuestGenerator from "./AiQuestGenerator";

type Profile = {
  username: string;
  level: number;
  xp: number;
  gold: number;
  streak: number;
  strength: number;
  intellect: number;
  discipline: number;
  vitality: number;
};

type View = "overview" | "quests" | "ai" | "shop" | "inventory";

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeView, setActiveView] = useState<View>("overview");

  function handleGoldChange(gold: number) {
    setProfile((current) => (current ? { ...current, gold } : current));
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "username, level, xp, gold, streak, strength, intellect, discipline, vitality"
      )
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("PROFILE LOAD ERROR:", error);
      return;
    }

    if (data) {
      setProfile(data);
    }
  }

  const progression = useMemo(() => {
    if (!profile) {
      return {
        xpIntoLevel: 0,
        xpNeededForLevel: 100,
        xpProgress: 0,
      };
    }

    const currentLevelStart =
      profile.level <= 1
        ? 0
        : Math.floor(100 * Math.pow(profile.level - 1, 1.5));
    const xpForNextLevel = Math.floor(100 * Math.pow(profile.level, 1.5));
    const xpIntoLevel = Math.max(0, profile.xp - currentLevelStart);
    const xpNeededForLevel = xpForNextLevel - currentLevelStart;
    const xpProgress = Math.min(
      100,
      Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100)
    );

    return {
      xpIntoLevel,
      xpNeededForLevel,
      xpProgress,
    };
  }, [profile]);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090d] text-white">
        <div className="text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 animate-pulse text-amber-300" />
          <p className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
            Entering your realm
          </p>
        </div>
      </main>
    );
  }

  const attributes = [
    {
      name: "Strength",
      value: profile.strength,
      icon: Swords,
      tone: "text-red-300",
      bg: "bg-red-400/10",
      description: "Physical effort",
    },
    {
      name: "Intellect",
      value: profile.intellect,
      icon: Brain,
      tone: "text-sky-300",
      bg: "bg-sky-400/10",
      description: "Learning focus",
    },
    {
      name: "Discipline",
      value: profile.discipline,
      icon: Target,
      tone: "text-amber-300",
      bg: "bg-amber-400/10",
      description: "Daily consistency",
    },
    {
      name: "Vitality",
      value: profile.vitality,
      icon: Heart,
      tone: "text-emerald-300",
      bg: "bg-emerald-400/10",
      description: "Health energy",
    },
  ];

  const navItems = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "quests" as const,
      label: "Quests",
      icon: ScrollText,
    },
    {
      id: "ai" as const,
      label: "AI Forge",
      icon: Bot,
    },
    {
      id: "shop" as const,
      label: "Shop",
      icon: Store,
    },
    {
      id: "inventory" as const,
      label: "Inventory",
      icon: Backpack,
    },
  ];

  const statCards = [
    {
      label: "Current level",
      value: profile.level,
      caption: "Hero rank",
      icon: Trophy,
    },
    {
      label: "XP earned",
      value: profile.xp,
      caption: `${Math.round(progression.xpProgress)}% to next level`,
      icon: Zap,
    },
    {
      label: "Gold",
      value: profile.gold,
      caption: "Spendable rewards",
      icon: Store,
    },
    {
      label: "Streak",
      value: `${profile.streak}d`,
      caption: "Daily momentum",
      icon: Flame,
    },
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-hidden bg-[#08090d] text-white"
    >
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.15),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.10),transparent_28%),linear-gradient(135deg,#08090d_0%,#101114_48%,#07080c_100%)]" />

      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-white/10 bg-black/20 px-5 py-6 backdrop-blur-xl lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10">
              <Swords className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                Life RPG
              </p>
              <p className="text-xs text-zinc-500">Command center</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                    isActive
                      ? "bg-amber-300 text-zinc-950 shadow-lg shadow-amber-950/30"
                      : "text-zinc-400 hover:bg-white/7 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Next level
              </p>
              <span className="text-xs font-black text-amber-300">
                {Math.round(progression.xpProgress)}%
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-300"
                style={{ width: `${progression.xpProgress}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              {progression.xpIntoLevel} of {progression.xpNeededForLevel} XP
              collected for level {profile.level + 1}.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090d]/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                  Welcome back, {profile.username}
                </p>
                <h1 className="mt-1 truncate text-xl font-black sm:text-2xl">
                  {navItems.find((item) => item.id === activeView)?.label}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-2xl border border-orange-300/20 bg-orange-400/10 px-3 py-2 text-sm font-black text-orange-200 sm:flex">
                  <Flame className="h-4 w-4" />
                  {profile.streak}
                </div>
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm font-black text-amber-200">
                  {profile.gold} G
                </div>
                <button
                  onClick={() => void supabase.auth.signOut()}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            <nav
              className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden"
              aria-label="Mobile primary"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition ${
                      isActive
                        ? "bg-amber-300 text-zinc-950"
                        : "border border-white/10 bg-white/[0.04] text-zinc-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </header>

          <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {activeView === "overview" && (
              <div className="space-y-6">
                <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl sm:p-8">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(251,191,36,0.16),transparent_38%,rgba(45,212,191,0.10))]" />
                    <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
                          Season 01
                        </p>
                        <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
                          Turn today into a playable mission.
                        </h2>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400">
                          Your RPG loop is split into focused workspaces: plan
                          quests, generate missions, earn rewards, and manage
                          inventory without losing context.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            onClick={() => setActiveView("quests")}
                            className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-amber-200"
                          >
                            Open Quest Board
                          </button>
                          <button
                            onClick={() => setActiveView("ai")}
                            className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                          >
                            Ask AI Forge
                          </button>
                        </div>
                      </div>

                      <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-amber-300/20 bg-black/25">
                        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-300/20 to-emerald-300/10">
                          <Swords className="h-12 w-12 text-amber-200" />
                          <span className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-zinc-400">
                            Level
                          </span>
                          <span className="text-4xl font-black text-amber-300">
                            {profile.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#101115] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
                          Rank progress
                        </p>
                        <h2 className="mt-2 text-2xl font-black">
                          Level {profile.level}
                        </h2>
                      </div>
                      <ShieldCheck className="h-6 w-6 text-emerald-300" />
                    </div>

                    <div className="mt-6">
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-black">
                          {progression.xpIntoLevel}
                        </span>
                        <span className="text-sm font-bold text-zinc-500">
                          / {progression.xpNeededForLevel} XP
                        </span>
                      </div>
                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300"
                          style={{ width: `${progression.xpProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={card.label}
                            className="rounded-2xl border border-white/10 bg-black/20 p-4"
                          >
                            <Icon className="h-4 w-4 text-amber-300" />
                            <p className="mt-3 text-2xl font-black">
                              {card.value}
                            </p>
                            <p className="mt-1 text-[11px] font-bold uppercase text-zinc-500">
                              {card.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {attributes.map((attribute) => {
                    const Icon = attribute.icon;

                    return (
                      <article
                        key={attribute.name}
                        className="rounded-3xl border border-white/10 bg-[#101115] p-5 transition hover:-translate-y-1 hover:border-white/20"
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${attribute.bg}`}
                          >
                            <Icon className={`h-5 w-5 ${attribute.tone}`} />
                          </div>
                          <span className="text-3xl font-black">
                            {attribute.value}
                          </span>
                        </div>
                        <h3 className="mt-5 font-black">{attribute.name}</h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {attribute.description}
                        </p>
                      </article>
                    );
                  })}
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                  {[
                    {
                      title: "Plan",
                      text: "Create focused quests from real goals.",
                      view: "quests" as const,
                    },
                    {
                      title: "Generate",
                      text: "Use local Ollama for instant mission ideas.",
                      view: "ai" as const,
                    },
                    {
                      title: "Reward",
                      text: "Spend gold and show earned treasure.",
                      view: "shop" as const,
                    },
                  ].map((step) => (
                    <button
                      key={step.title}
                      onClick={() => setActiveView(step.view)}
                      className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-amber-300/30 hover:bg-white/[0.06]"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                        {step.title}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {step.text}
                      </p>
                      <ChevronRight className="mt-5 h-5 w-5 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-amber-300" />
                    </button>
                  ))}
                </section>
              </div>
            )}

            {activeView === "quests" && (
              <section className="space-y-5">
                <SectionIntro
                  eyebrow="Quest Board"
                  title="Plan and complete today's adventures"
                  description="A focused workspace for creating tasks, earning XP, and progressing without scrolling through the whole product."
                />
                <Quests onProgressChange={loadProfile} />
              </section>
            )}

            {activeView === "ai" && (
              <section className="space-y-5">
                <SectionIntro
                  eyebrow="AI Forge"
                  title="Generate a mission plan"
                  description="Your local Ollama model drafts practical quests, with a safe fallback if the model is still loading."
                />
                <AiQuestGenerator
                  onQuestsAdded={async () => {
                    await loadProfile();
                    setActiveView("quests");
                  }}
                />
              </section>
            )}

            {activeView === "shop" && (
              <section className="space-y-5">
                <SectionIntro
                  eyebrow="Reward Economy"
                  title="Spend gold on visible wins"
                  description="A separate shop makes the reward loop feel intentional instead of buried under task controls."
                />
                <Shop gold={profile.gold} onGoldChange={handleGoldChange} />
              </section>
            )}

            {activeView === "inventory" && (
              <section className="space-y-5">
                <SectionIntro
                  eyebrow="Inventory"
                  title="Show proof of progress"
                  description="Collected items stay in their own space, giving players a reason to return after every quest session."
                />
                <Inventory />
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
        {description}
      </p>
    </div>
  );
}
