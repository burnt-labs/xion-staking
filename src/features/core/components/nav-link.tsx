"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/config";

type NavLinkProps = NavItem & {
  className?: string;
  onClick?: () => void;
};

const NavLink = ({ className, href, label, onClick }: NavLinkProps) => {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      className={`mx-4 text-[16px] text-lg font-bold font-semibold uppercase text-white ${
        isActive ? "border-b-2 border-white" : ""
      } ${className}`}
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default NavLink;
