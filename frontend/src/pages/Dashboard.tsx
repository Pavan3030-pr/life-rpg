import { useEffect, useState } from "react";
import {
  Brain,
  Flame,
  Heart,
  LogOut,
  Sparkles,
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

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);

  function handleGoldChange(gold: number) {
    setProfile((current) =>
      current ? { ...current, gold } : current
    );
  }

  useEffect(() => {
    loadProfile();
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

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07080c] text-white">
        <div className="text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 animate-pulse text-amber-400" />
          <p className="text-sm tracking-[0.25em] text-zinc-500">
            ENTERING YOUR REALM
          </p>
        </div>
      </main>
    );
  }

  const currentLevelStart =
    profile.level <= 1
      ? 0
      : Math.floor(100 * Math.pow(profile.level - 1, 1.5));

  const xpForNextLevel = Math.floor(
    100 * Math.pow(profile.level, 1.5)
  );

  const xpIntoLevel = Math.max(
    0,
    profile.xp - currentLevelStart
  );

  const xpNeededForLevel =
    xpForNextLevel - currentLevelStart;

  const xpProgress = Math.min(
    100,
    Math.max(
      0,
      (xpIntoLevel / xpNeededForLevel) * 100
    )
  );

  const attributes = [
    {
      name: "Strength",
      value: profile.strength,
      icon: Swords,
      description: "Physical effort",
    },
    {
      name: "Intellect",
      value: profile.intellect,
      icon: Brain,
      description: "Learning & focus",
    },
    {
      name: "Discipline",
      value: profile.discipline,
      icon: Target,
      description: "Consistency",
    },
    {
      name: "Vitality",
      value: profile.vitality,
      icon: Heart,
      description: "Health & energy",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07080c] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-[140px]" />
        <div className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.05] blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* Top navigation */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
              <Swords className="h-5 w-5 text-amber-400" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                LIFE RPG
              </p>
              <p className="text-xs text-zinc-500">
                Your life. Your adventure.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-orange-400/15 bg-orange-400/[0.06] px-3 py-2 sm:flex">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-bold">
                {profile.streak}
              </span>
              <span className="text-xs text-zinc-500">
                day streak
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2">
              <span className="text-sm">🪙</span>
              <span className="text-sm font-bold text-amber-300">
                {profile.gold}
              </span>
            </div>

            <button
              onClick={() => supabase.auth.signOut()}
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              <LogOut className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-transparent shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.10),transparent_45%)]" />

          <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px_1fr] lg:p-10">
            {/* Left */}
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
                Welcome back, {profile.username}
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Your journey
                <br />
                <span className="text-zinc-400">
                  continues.
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-500 lg:mx-0">
                Every real-world action shapes your hero.
                Complete quests, earn rewards, and become
                stronger one day at a time.
              </p>
            </div>

            {/* Character */}
            <div className="order-1 flex justify-center lg:order-2">
              <div className="relative">
                <div className="absolute inset-[-30px] rounded-full bg-amber-400/[0.07] blur-3xl" />

                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-amber-400/20 bg-gradient-to-b from-amber-400/[0.10] to-transparent shadow-[0_0_80px_rgba(251,191,36,0.08)] sm:h-60 sm:w-60">
                  <div className="absolute inset-4 rounded-full border border-dashed border-amber-400/15" />

                  <div className="relative flex flex-col items-center">
                    <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/20 to-orange-600/10 shadow-xl">
                      <span className="text-5xl drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                        ⚔️
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                        Level
                      </span>
                      <span className="text-2xl font-black text-amber-400">
                        {profile.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-3 top-8 rounded-full border border-amber-400/20 bg-[#101116] px-3 py-1.5 text-xs font-bold text-amber-300 shadow-xl">
                  <Zap className="mr-1 inline h-3 w-3" />
                  HERO
                </div>
              </div>
            </div>

            {/* Right XP */}
            <div className="order-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                      Experience
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {xpIntoLevel}
                      <span className="ml-1 text-sm font-medium text-zinc-600">
                        / {xpNeededForLevel} XP
                      </span>
                    </p>
                  </div>

                  <Trophy className="h-5 w-5 text-amber-400/70" />
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.45)] transition-all duration-700"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-600">
                    Level {profile.level}
                  </span>
                  <span className="font-semibold text-amber-400">
                    {Math.round(xpProgress)}%
                  </span>
                  <span className="text-zinc-600">
                    Level {profile.level + 1}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3 text-xs text-zinc-500">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Complete quests to unlock your next level.
              </div>
            </div>
          </div>
        </section>

        {/* Attributes */}
        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
                Character
              </p>
              <h2 className="mt-1 text-xl font-black">
                Your Attributes
              </h2>
            </div>

            <p className="hidden text-xs text-zinc-600 sm:block">
              Your actions shape who you become.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {attributes.map((attribute) => {
              const Icon = attribute.icon;

              return (
                <div
                  key={attribute.name}
                  className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-400/20 hover:bg-white/[0.055]"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-amber-400/[0.04] blur-2xl transition group-hover:bg-amber-400/[0.08]" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                        <Icon className="h-4 w-4 text-zinc-400 transition group-hover:text-amber-400" />
                      </div>

                      <span className="text-2xl font-black text-white">
                        {attribute.value}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-bold">
                      {attribute.name}
                    </p>

                    <p className="mt-1 text-[11px] text-zinc-600">
                      {attribute.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Quest Generator */}
        <section className="mt-8">
          <AiQuestGenerator onQuestsAdded={async () => {
            await loadProfile();
          }} />
        </section>

        {/* Quests */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
                Quest Board
              </p>
              <h2 className="mt-1 text-2xl font-black">
                Today's Adventures
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Turn real-world goals into progress.
              </p>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-500 sm:block">
              ⚔️ Make today count
            </div>
          </div>

          <Quests onProgressChange={loadProfile} />
        </section>

        {/* Shop */}
        <section className="mt-8">
          <Shop
            gold={profile.gold}
            onGoldChange={handleGoldChange}
          />
        </section>

        {/* Inventory */}
        <section className="mt-8 pb-10">
          <Inventory />
        </section>
      </div>
    </main>
  );
}
