import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavItem } from "@/config";

type NavLinkProps = NavItem & {
  className?: string;
};

const NavLink: React.FC<NavLinkProps> = ({
  href,
  label,
  isRootLink,
  className = "",
}) => {
  const pathname = usePathname();

  const isActive =
    pathname.startsWith(href) || (isRootLink && pathname === "/");

  return (
    <Link
      className={`mx-4 text-[16px] text-lg font-bold font-semibold uppercase text-white ${
        isActive ? "border-b-2 border-white" : ""
      } ${className}`}
      href={href}
    >
      {label}
    </Link>
  );
};

export default NavLink;
