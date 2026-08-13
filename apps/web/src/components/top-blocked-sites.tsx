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

export function TopBlockedSites({
  sites,
  className,
}: {
  sites: { domain: string; attempts: number }[];
  className?: string;
}) {
  const data = sites
    .filter(({ attempts }) => attempts > 0)
    .map(({ domain, attempts }) => ({
      icon: favicon(`https://${domain}`),
      title: domain,
      href: `https://${domain}`,
      value: attempts,
    }));
  return (
    <section className={cn("h-full rounded-xl border bg-card p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Top blocked sites</h3>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">
            Sites with the most blocked attempts in this period
          </p>
        </div>
      </div>

      {data.length > 0 ? (
        <BarList
          tab="Websites"
          unit="attempts"
          data={data}
          limit={5}
          ditherColor="green"
          ditherVariant="gradient"
          hoverBackground="hover:bg-emerald-500/10"
          minBarWidth={12}
        />
      ) : (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          No data available yet
        </div>
      )}
    </section>
  );
}
