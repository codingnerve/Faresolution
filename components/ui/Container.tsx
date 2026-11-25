import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  as?: ElementType;
  /** `default` page width, `narrow` for long-form reading, `wide` for dense tables. */
  width?: "default" | "narrow" | "wide";
  className?: string;
  children: ReactNode;
  id?: string;
};

const widths = {
  default: "max-w-page",
  narrow: "max-w-reading",
  wide: "max-w-[88rem]",
} as const;

export function Container({
  as: Component = "div",
  width = "default",
  className,
  children,
  id,
}: ContainerProps) {
  return (
    <Component
      id={id}
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[width], className)}
    >
      {children}
    </Component>
  );
}
