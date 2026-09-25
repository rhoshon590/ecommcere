import { Link } from "react-router-dom";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
  asLink?: boolean;
};

const sizeMap = {
  sm: { mark: "h-6 w-6", text: "text-lg", sub: "text-[8px]" },
  md: { mark: "h-7 w-7 md:h-8 md:w-8", text: "text-xl md:text-2xl", sub: "text-[9px]" },
  lg: { mark: "h-10 w-10", text: "text-3xl", sub: "text-[10px]" },
};

/**
 * Brand identity for AuraShop.
 * Combines a hand-drawn SVG mark (a stylized vessel) with a serif wordmark
 * and a small "Stoneware Studio" tagline.
 */
export function BrandMark({ size = "md", className = "", asLink = true }: Props) {
  const s = sizeMap[size];

  const inner = (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="AuraShop — Stoneware Studio"
    >
      <span
        className={`${s.mark} flex-shrink-0 inline-flex items-center justify-center rounded-full bg-primary text-on-primary`}
      >
        <VesselMark className="h-[60%] w-[60%]" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-heading ${s.text} tracking-wide text-primary leading-none`}
        >
          Aura<span className="text-accent">Shop</span>
        </span>
        <span
          className={`${s.sub} uppercase tracking-[0.32em] text-secondary mt-1`}
        >
          Stoneware Studio
        </span>
      </span>
    </span>
  );

  if (!asLink) return inner;

  return (
    <Link
      to="/"
      className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
    >
      {inner}
    </Link>
  );
}

function VesselMark({ className = "" }: { className?: string }) {
  // Stylized vessel silhouette — narrow neck, rounded body, foot
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M8.5 4h7" />
      <path d="M9 4v2.2c0 .7-.3 1.3-.8 1.8C6.8 9.2 6 10.9 6 12.7v3.6C6 18.4 7.6 20 9.6 20h4.8c2 0 3.6-1.6 3.6-3.7v-3.6c0-1.8-.8-3.5-2.2-4.7-.5-.5-.8-1.1-.8-1.8V4" />
      <path d="M6.4 13.5h11.2" />
    </svg>
  );
}
