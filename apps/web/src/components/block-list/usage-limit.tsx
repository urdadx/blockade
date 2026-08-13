import { DitherBarFill } from "@/components/dither-bar-fill";
import type { DitherColor } from "@/components/dither-kit/palette";

export function UsageLimit({
  dailyLimit,
  usedMinutes,
  applicable = true,
}: {
  dailyLimit: string;
  usedMinutes: number;
  applicable?: boolean;
}) {
  if (!applicable) {
    return <span className="text-sm text-muted-foreground">Not applicable</span>;
  }

  if (dailyLimit === "none") {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <div className="h-3 w-24 overflow-hidden rounded-none bg-muted/60 opacity-50 sm:w-32">
          <DitherBarFill color="grey" variant="dotted" />
        </div>
        <span className="text-sm text-foreground">No limit set</span>
      </div>
    );
  }

  const limitMinutes = Number(dailyLimit);
  if (!Number.isFinite(limitMinutes) || limitMinutes <= 0) {
    return <span className="text-sm text-muted-foreground">No limit</span>;
  }

  const usedPercent = Math.min(100, (usedMinutes / limitMinutes) * 100);
  const remainingMinutes = Math.max(0, limitMinutes - usedMinutes);
  const color: DitherColor = usedPercent >= 90 ? "red" : usedPercent >= 70 ? "orange" : "green";

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="h-3 w-24 overflow-hidden rounded-none bg-muted/60 sm:w-32">
        <div
          className="h-full overflow-hidden rounded-none opacity-60 transition-[width] duration-300"
          style={{ width: `${usedPercent}%` }}
        >
          <DitherBarFill color={color} />
        </div>
      </div>
      <span className="text-foreground tabular-nums">
        {remainingMinutes === 0 ? "Limit reached" : `${remainingMinutes} min left`}
      </span>
    </div>
  );
}
