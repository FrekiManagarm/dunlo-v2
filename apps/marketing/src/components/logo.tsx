interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 28 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <rect width="32" height="32" rx="8.5" fill="var(--dunlo-accent)" />
      <path
        d="M 16 25 A 9 9 0 1 0 7 16"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 4.5 18.5 L 7 16 L 9.5 18.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({
  withText = true,
  size = 28,
  dark = false,
}: {
  withText?: boolean;
  size?: number;
  dark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {withText && (
        <span
          className={`font-sans text-[15px] font-semibold leading-none tracking-tight ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          dunlo
        </span>
      )}
    </span>
  );
}
