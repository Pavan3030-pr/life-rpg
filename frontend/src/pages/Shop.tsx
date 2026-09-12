import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type ShopItem = {
  id: string;
  item_key: string;
  name: string;
  description: string;
  icon: string;
  price: number;
};

type ShopProps = {
  gold: number;
  onGoldChange: (gold: number) => void;
};

export default function Shop({ gold, onGoldChange }: ShopProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [purchasedItem, setPurchasedItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    loadShop();
  }, []);

  async function loadShop() {
    const { data, error } = await supabase
      .from("shop_items")
      .select("id, item_key, name, description, icon, price")
      .order("price");

    if (error) {
      console.error("SHOP LOAD ERROR:", error);
      setMessage("Unable to load the shop.");
      setLoading(false);
      return;
    }

    setItems(data ?? []);
    setLoading(false);
  }

  async function buyItem(item: ShopItem) {
    if (buying) return;

    if (gold < item.price) {
      setMessage("Not enough gold.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setMessage("Please log in again.");
      return;
    }

    setBuying(item.item_key);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/quests/purchase",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            itemKey: item.item_key,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message ?? "Purchase failed.");
        return;
      }

      onGoldChange(result.remainingGold);
      setPurchasedItem(item);
      window.setTimeout(() => {
        setPurchasedItem(null);
      }, 2200);
      setMessage(`${item.icon} ${item.name} purchased!`);
    } catch (error) {
      console.error("PURCHASE REQUEST ERROR:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setBuying(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        Loading the shop...
      </section>
    );
  }

  return (
    <>
      {purchasedItem && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-3xl border border-amber-400/40 bg-zinc-950/95 px-10 py-8 text-center shadow-2xl shadow-amber-500/20">
            <div className="text-6xl">{purchasedItem.icon}</div>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-amber-400">
              Treasure Acquired
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {purchasedItem.name}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Added to your inventory
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
            Adventurer's Shop
          </p>
          <h2 className="mt-2 text-2xl font-bold">Spend your Gold</h2>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-bold text-yellow-400">
          🪙 {gold} G
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
          {message}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:-translate-y-1 hover:border-amber-500/50"
          >
            <div className="text-4xl">{item.icon}</div>

            <h3 className="mt-4 font-bold">{item.name}</h3>

            <p className="mt-2 min-h-12 text-sm text-zinc-500">
              {item.description}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-bold text-yellow-400">
                🪙 {item.price}
              </span>

              <button
                onClick={() => buyItem(item)}
                disabled={buying !== null || gold < item.price}
                className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {buying === item.item_key ? "Buying..." : "Buy"}
              </button>
            </div>
          </div>
        ))}
      </div>
      </section>
    </>
  );
}
