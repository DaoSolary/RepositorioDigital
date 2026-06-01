type BarItem = { label: string; value: number };

export function SimpleBarChart({ items, maxValue }: { items: BarItem[]; maxValue?: number }) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="truncate pr-2 text-zinc-600 dark:text-zinc-400">{item.label}</span>
            <span className="font-medium tabular-nums">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
