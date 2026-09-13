import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import SkipLink from "./components/SkipLink";
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
    return (
      <>
        <SkipLink />
        <Auth />
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <Dashboard />
    </>
  );
}

export default App;
