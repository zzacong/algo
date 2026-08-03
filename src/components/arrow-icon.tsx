import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ArrowIconProps {
  direction?: "left" | "right";
  className?: string;
}

export function ArrowIcon({ direction = "right", className }: ArrowIconProps) {
  return (
    <HugeiconsIcon
      icon={direction === "right" ? ArrowRight01Icon : ArrowLeft01Icon}
      className={className}
      aria-hidden="true"
    />
  );
}
