"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigationItems = [
  { href: "/", label: "Pulpit", exact: true },
  { href: "/applications", label: "Aplikacje" },
  { href: "/job-offers", label: "Oferty pracy" },
  { href: "/cv-library", label: "Biblioteka CV" },
  { href: "/portfolio", label: "Portfolio" },
];

function isCloudRoute(pathname: string) {
  return pathname === "/" || navigationItems.some((item) => !item.exact && pathname.startsWith(item.href));
}

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function Brand() {
  return (
    <>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#263b2c] text-lg font-bold text-white">J</span>
      <span className="text-lg font-semibold tracking-tight">Jobilot <em className="font-medium text-[#5e7863]">AI</em></span>
    </>
  );
}

export function CloudNavigationFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (!isCloudRoute(pathname)) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f7f7f4]">
      <div className="mx-auto max-w-[1540px] lg:hidden">
        <header className="flex items-center justify-between border-b border-[#e6e7df] bg-[#fbfbf8] px-5 py-4 sm:px-8">
          <Link className="flex items-center gap-3" href="/" aria-label="Jobilot AI — pulpit">
            <Brand />
          </Link>
        </header>
        <nav aria-label="Nawigacja mobilna" className="flex gap-2 overflow-x-auto border-b border-[#e6e7df] bg-[#fbfbf8] px-5 py-3 sm:px-8">
          {navigationItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                className={active
                  ? "shrink-0 rounded-xl bg-[#e7efe5] px-3 py-2 text-sm font-medium text-[#26432c]"
                  : "shrink-0 rounded-xl px-3 py-2 text-sm font-medium text-[#687167] hover:bg-[#f0f2ec] hover:text-[#263b2c]"}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1540px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e6e7df] bg-[#fbfbf8] px-5 py-7 lg:flex">
          <Link className="mb-12 flex items-center gap-3 px-2" href="/" aria-label="Jobilot AI — pulpit">
            <Brand />
          </Link>

          <nav aria-label="Główna nawigacja" className="space-y-1">
            {navigationItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  className={active
                    ? "block rounded-xl bg-[#e7efe5] px-3 py-2.5 text-sm font-medium text-[#26432c]"
                    : "block rounded-xl px-3 py-2.5 text-sm font-medium text-[#687167] hover:bg-[#f0f2ec] hover:text-[#263b2c]"}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-[#263b2c] p-4 text-[#f8fbf6]">
            <p className="text-xs font-medium text-[#c7d8c5]">Cloud Mode</p>
            <p className="mt-1 text-sm font-semibold">Twoje dane są prywatne</p>
            <p className="mt-2 text-xs leading-5 text-[#c7d8c5]">AI jest opcjonalne i wymaga świadomej zgody osobno dla wybranej aplikacji na ofertę pracy.</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
