import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";

function formatLimit(minutes: number) {
  if (minutes < 60) return `${minutes} mins`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hourLabel = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return remainingMinutes ? `${hourLabel} ${remainingMinutes} mins` : hourLabel;
}

const dailyLimitOptions = [
  { label: "No limit", value: "none" },
  ...Array.from({ length: 24 * 12 }, (_, index) => {
    const minutes = (index + 1) * 5;
    return { label: formatLimit(minutes), value: String(minutes) };
  }),
];

export function DailyLimitSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select
      items={dailyLimitOptions}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onValueChange(nextValue);
      }}
    >
      <SelectTrigger size="sm" className="w-36 bg-background sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72" align="start">
        {dailyLimitOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
