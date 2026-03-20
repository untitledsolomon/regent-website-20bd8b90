"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ClassNameValue =
  | string
  | ((args: { isActive: boolean; isPending: boolean }) => string | undefined);

interface NavLinkCompatProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> {
  to: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to;
    const isPending = false;

    const resolvedClassName =
      typeof className === "function"
        ? (className as ClassNameValue)({ isActive, isPending })
        : className;

    return (
      <Link href={to} legacyBehavior>
        <a
          ref={ref}
          className={cn(
            resolvedClassName,
            isActive && activeClassName,
            isPending && pendingClassName,
          )}
          {...props}
        />
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
