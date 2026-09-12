import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type InventoryItem = {
  id: string;
  item_key: string;
  item_name: string;
  item_description: string | null;
  item_icon: string | null;
  price: number;
  quantity: number;
};

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    const { data, error } = await supabase
      .from("inventory")
      .select(
        "id, item_key, item_name, item_description, item_icon, price, quantity"
      )
      .gt("quantity", 0)
      .order("purchased_at", { ascending: false });

    if (error) {
      console.error("INVENTORY LOAD ERROR:", error);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-slate-400">Loading inventory...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
        Adventurer's Inventory
      </p>

      <h2 className="mt-2 text-2xl font-bold text-white">
        Your Treasures
      </h2>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
          <div className="text-4xl">🎒</div>
          <p className="mt-3 text-slate-400">
            Your inventory is empty
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Complete quests and visit the shop to collect items.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">
                  {item.item_icon ?? "🎁"}
                </span>

                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300">
                  ×{item.quantity}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold text-white">
                {item.item_name}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {item.item_description ?? "A treasured item."}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
