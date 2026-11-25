import Link from "next/link";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  href?: string;
};

const sizes = {
  sm: { box: 32, text: 18 },
  md: { box: 38, text: 21 },
  lg: { box: 48, text: 26 },
};

export function Logo({ size = "md", href = "/" }: LogoProps) {
  const current = sizes[size];

  return (
    <Link className="logo" href={href} aria-label="FlatRent">
      <svg width={current.box} height={current.box} viewBox="0 0 48 48" role="img" aria-hidden="true">
        <rect width="48" height="48" rx="12" fill="#1A6FD4" />
        <path d="M13 21.5 24 12l11 9.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 16h19v6H23v6h11v6H23v10h-7V16Z" fill="#fff" />
      </svg>
      <span style={{ fontSize: current.text }}>FlatRent</span>
    </Link>
  );
}
