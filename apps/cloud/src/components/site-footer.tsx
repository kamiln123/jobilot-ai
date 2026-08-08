import Link from "next/link";

import { PRODUCT_AUTHOR, PRODUCT_GITHUB_URL, PRODUCT_VERSION } from "@/lib/product";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e2e5dd] bg-[#fbfbf8] px-5 py-7 text-sm text-[#687167] sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1540px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[#2f4031]">Jobilot AI</p>
          <p className="mt-1 text-xs">Zarządzanie procesem poszukiwania pracy.</p>
        </div>

        <nav aria-label="Informacje o projekcie" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium">
          <Link className="text-[#456a4b] hover:text-[#294b30]" href="/about">O projekcie</Link>
          <Link className="text-[#456a4b] hover:text-[#294b30]" href="/local-vault">Local Vault</Link>
          <a className="text-[#456a4b] hover:text-[#294b30]" href={PRODUCT_GITHUB_URL} rel="noreferrer" target="_blank">
            {PRODUCT_AUTHOR} · GitHub ↗
          </a>
        </nav>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7b8179]">
          <span>{PRODUCT_VERSION}</span>
          <span>© 2026 Jobilot AI</span>
        </div>
      </div>
    </footer>
  );
}
