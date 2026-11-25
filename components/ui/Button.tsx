import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, keyof CommonProps>;

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, keyof CommonProps> & { href?: undefined };

export type ButtonProps = ButtonAsLink | ButtonAsButton;

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 select-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  primary: "rounded-md bg-navy text-white shadow-card hover:bg-navy-soft",
  secondary:
    "rounded-md border border-line-strong bg-surface text-ink shadow-card hover:border-muted/60 hover:bg-surface-alt",
  ghost: "rounded-md text-ink hover:bg-surface-alt",
  link: "rounded-xs text-blue-ink underline decoration-blue/30 underline-offset-4 hover:decoration-blue",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[0.8125rem]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[0.9375rem]",
};

const linkSizes: Record<ButtonSize, string> = {
  sm: "text-[0.8125rem]",
  md: "text-sm",
  lg: "text-[0.9375rem]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    base,
    variants[variant],
    variant === "link" ? linkSizes[size] : sizes[size],
    className,
  );
}

/** Renders a Next.js `<Link>` when `href` is given, otherwise a `<button>`. */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, className, children, ...rest } = props;
    return (
      <Link className={buttonClasses({ variant, size, className })} {...rest}>
        {children}
      </Link>
    );
  }
  const {
    variant,
    size,
    className,
    children,
    type = "button",
    ...rest
  } = props as ButtonAsButton;
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {children}
    </button>
  );
}
