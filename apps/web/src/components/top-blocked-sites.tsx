import BarList from "@/components/bar-list";
import { cn, getWebsiteFaviconUrl } from "@/lib/utils";

const favicon = (url: string) => (
  <img
    src={getWebsiteFaviconUrl(url)}
    alt=""
    loading="lazy"
    decoding="async"
    className="size-5 rounded-sm outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
  />
);

const blockedSites = [
  {
    icon: favicon("https://youtube.com"),
    title: "youtube.com",
    href: "https://youtube.com",
    value: 128,
  },
  {
    icon: favicon("https://instagram.com"),
    title: "instagram.com",
    href: "https://instagram.com",
    value: 96,
  },
  {
    icon: favicon("https://x.com"),
    title: "x.com",
    href: "https://x.com",
    value: 74,
  },
  {
    icon: favicon("https://reddit.com"),
    title: "reddit.com",
    href: "https://reddit.com",
    value: 61,
  },
  {
    icon: favicon("https://tiktok.com"),
    title: "tiktok.com",
    href: "https://tiktok.com",
    value: 43,
  },
];

export function TopBlockedSites({ className }: { className?: string }) {
  return (
    <section className={cn("h-full rounded-xl border bg-card p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Top blocked sites</h3>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">
            Sites with the most blocked attempts this week
          </p>
        </div>
      </div>

      <BarList
        tab="Websites"
        unit="attempts"
        data={blockedSites}
        limit={5}
        ditherColor="green"
        ditherVariant="gradient"
        hoverBackground="hover:bg-emerald-500/10"
        minBarWidth={12}
      />
    </section>
  );
}
