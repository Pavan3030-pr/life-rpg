import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("LIFE RPG RENDER ERROR:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#07080c] px-6 text-white">
          <section className="max-w-md rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">
              Realm Stabilized
            </p>
            <h1 className="mt-3 text-2xl font-black">
              Something went wrong.
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Refresh the page to re-enter your quest board without losing saved progress.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-red-300 px-5 py-3 text-sm font-black text-red-950 transition hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              Reload Realm
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
