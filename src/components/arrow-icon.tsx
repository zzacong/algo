interface ArrowIconProps {
  direction?: "left" | "right";
  className?: string;
}

export function ArrowIcon({ direction = "right", className }: ArrowIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "right" ? (
        <path d="M5 12h14M13 6l6 6-6 6" />
      ) : (
        <path d="M19 12H5M11 6l-6 6 6 6" />
      )}
    </svg>
  );
}
