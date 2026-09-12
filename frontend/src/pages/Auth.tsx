import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Account created. Check your email to verify your account.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Login successful!");
      }
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            LIFE RPG
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            {mode === "login" ? "Enter Your Realm" : "Begin Your Journey"}
          </h1>
          <p className="mt-3 text-zinc-400">
            Turn real life into an adventure.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl"
        >
          {mode === "signup" && (
            <label className="mb-4 block">
              <span className="mb-2 block text-sm text-zinc-300">
                Hero name
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-400"
                placeholder="ShadowKnight"
              />
            </label>
          )}

          <label className="mb-4 block">
            <span className="mb-2 block text-sm text-zinc-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-400"
              placeholder="hero@example.com"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm text-zinc-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-400"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : mode === "login"
                ? "Enter Realm"
                : "Create Hero"}
          </button>

          {message && (
            <p className="mt-4 text-center text-sm text-zinc-300">{message}</p>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
            }}
            className="mt-5 w-full text-sm text-amber-400 hover:text-amber-300"
          >
            {mode === "login"
              ? "New hero? Create an account"
              : "Already have an account? Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
