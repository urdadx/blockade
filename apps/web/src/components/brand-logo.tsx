import { cn } from "@/lib/utils";
import type { SVGProps } from "react";
import logoUrl from "/logo.png?url";

export function BrandLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 70 70"
      role="img"
      aria-label="Blockade"
      className={cn("size-9 shrink-0", className)}
      {...props}
    >
      <defs>
        <clipPath id="brand-logo-clip">
          <rect width="64" height="64" rx="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#brand-logo-clip)">
        <rect width="64" height="64" className="fill-primary" />
        <image href={logoUrl} x="4" y="4" width="56" height="56" />
      </g>
    </svg>
  );
}
