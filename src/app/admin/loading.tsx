import { Card } from "@/components/ui/card";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80 ${className ?? ""}`} />;
}

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-32 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-32 w-full" />
        </Card>
      </div>
      <Card className="p-5">
        <Skeleton className="h-4 w-48" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
