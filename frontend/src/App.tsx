import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  return <Dashboard />;

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
          LIFE RPG
        </p>
        <h1 className="mt-4 text-4xl font-bold">Your adventure begins.</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 rounded-xl bg-zinc-800 px-5 py-3 hover:bg-zinc-700"
        >
          Log out
        </button>
      </div>
    </main>
  );
}

export default App;
