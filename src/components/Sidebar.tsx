import Image from "next/image";
import SidebarNavLink from "@/components/SidebarNavLink";
import ThemeToggle from "@/components/ThemeToggle";

const icons = {
  estoque: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4 7.5 12 11l8-3.5M12 11v9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  novo: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  modelos: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M12.59 3.41 20 10.83a2 2 0 0 1 0 2.83l-6.34 6.34a2 2 0 0 1-2.83 0L3.41 12.59A2 2 0 0 1 3 11.17V5a2 2 0 0 1 2-2h6.17a2 2 0 0 1 1.42.41Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
    </svg>
  ),
};

const navItems = [
  { href: "/", label: "Estoque", icon: icons.estoque },
  { href: "/produtos/novo", label: "Novo produto", icon: icons.novo },
  { href: "/categorias", label: "Modelos", icon: icons.modelos },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  return (
    <aside className="flex w-full flex-col border-b border-[var(--border)] bg-[var(--surface)] md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r md:sticky md:top-0">
      <div className="flex items-center gap-2 px-4 py-4">
        <Image
          src="/logo.png"
          alt="193 Shoes"
          width={36}
          height={36}
          className="rounded-full"
          priority
        />
        <span className="text-base font-semibold tracking-tight text-[var(--text)]">
          193 Shoes
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        <span className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Catálogo
        </span>
        {navItems.map((item) => (
          <SidebarNavLink key={item.href} href={item.href}>
            {item.icon}
            {item.label}
          </SidebarNavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-[var(--border)] px-3 py-3">
        <ThemeToggle />
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="truncate text-xs text-[var(--text-faint)]">
            {userEmail}
          </span>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
